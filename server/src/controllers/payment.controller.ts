import { Request, Response } from "express";
import { logger } from "../utils/logger";
import PaymentService from "../services/payment.service";
import { OnslipService } from "../services/onslip.service";
import { DeliveryService } from "../services/delivery.service";
import { ApplicationError, ErrorCode } from "../middleware/error.middleware";
import { DeliveryDetails } from "../types/delivery.types";
import { API } from "@onslip/onslip-360-node-api"; 

interface DeliveryItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

interface ExternalRecordItem extends API.Item {
    product: number;
    'product-name': string;
    name: string;
    quantity: number;
    price: number;
    type: 'goods';
    amount: number;
    'vat-rate': number;
    'vat-amount': number;
}

export class PaymentController {
    private paymentService: typeof PaymentService;
    private onslipService: OnslipService;
    private deliveryService: DeliveryService;

    constructor() {
        this.paymentService = PaymentService;
        this.onslipService = OnslipService.getInstance();
        this.deliveryService = new DeliveryService();
    }

    private async handleSuccessfulPayment(
        order: API.Order, 
        orderId: string, 
        deliveryDetails: DeliveryDetails
    ) {
        console.log('=== Handling Successful Payment ===');
        console.log('Order ID:', orderId);
        console.log('Delivery Details:', deliveryDetails);

        try {
            console.log('Adding transaction to journal...');
            await this.onslipService.addJournalRecord(order, orderId);
            logger.info('Transaction added to journal', { orderId });

            console.log('Sending payment confirmation...');
            await this.deliveryService.sendPaymentConfirmation(
                deliveryDetails,
                orderId
            );
            
            logger.info('Payment confirmation sent', { orderId });
        } catch (error) {
            logger.error('Error handling successful payment:', error);
            throw error;
        }
    }

    createJournalEntry = async (req: Request, res: Response): Promise<void> => {
        console.log("=== Creating Journal Entry ===");
        console.log("Request body:", req.body);

        try {
            const { orderId, deliveryDetails } = req.body;

            if (!orderId || !deliveryDetails) {
                throw new ApplicationError(
                    "Missing required data",
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }

            const items: ExternalRecordItem[] = deliveryDetails.items.map((item: DeliveryItem) => ({
                product: parseInt(item.id),
                'product-name': item.name,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                type: 'goods',
                amount: -(item.price * item.quantity),
                'vat-rate': 25,
                'vat-amount': -(item.price * item.quantity * 0.25)
            }));

            const externalRecord: API.ExternalRecord = {
                date: new Date().toISOString(),
                type: 'receipt',
                'timezone-offset': new Date().getTimezoneOffset(),
                'client-name': 'Onslip Kiosk',
                'cashier-name': 'System',
                description: `Web order ${orderId}`,
                receipt: {
                    type: 'sale',
                    items,
                    rounding: 0,
                    payments: [{
                        method: 'card',
                        amount: -deliveryDetails.totalAmount,
                        name: 'Card Payment'
                    }],
                    change: 0,
                    reference: orderId,
                    'our-reference': orderId
                }
            };

            console.log('Creating external record:', {
                ...externalRecord,
                receipt: {
                    ...externalRecord.receipt,
                    items: `${items.length} items`
                }
            });

            const result = await this.onslipService.addJournalRecord(externalRecord);
            logger.info('Journal entry created successfully', { 
                orderId,
                recordId: result.id 
            });

            res.status(200).json({
                success: true,
                message: 'Journal entry created successfully'
            });
        } catch (error) {
            logger.error('Error creating journal entry:', error);
            if (error instanceof ApplicationError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                });
            } else {
                res.status(500).json({
                    error: "Could not create journal entry",
                    code: ErrorCode.INTERNAL_ERROR,
                });
            }
        }
    };

    processPayment = async (req: Request, res: Response): Promise<void> => {
        console.log("=== Processing payment request ===");
        console.log("Request body:", req.body);

        try {
            if (!this.validatePaymentRequest(req.body)) {
                throw new ApplicationError(
                    "Invalid payment request",
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }

            const { deliveryDetails, order, totalAmount } = req.body;

            console.log('Creating order in Onslip...');
            await this.onslipService.addOrder(order);
            logger.info("Order added to Onslip", {
                orderId: deliveryDetails.orderId,
            });

            console.log('Processing delivery order...');
            await this.deliveryService.processNewOrder(deliveryDetails);

            console.log('Creating Smart Checkout payment order...');
            const paymentResult =
                await this.paymentService.createSmartCheckoutOrder(
                    totalAmount,
                    deliveryDetails.orderId
                );

            logger.info("Payment result:", paymentResult);

            res.json({
                status: paymentResult.status,
                message: paymentResult.message,
                transactionId: paymentResult.transactionId,
                checkoutUrl: paymentResult.checkoutUrl,
            });
        } catch (error) {
            logger.error("Payment processing error:", error);
            if (error instanceof ApplicationError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                });
            } else {
                res.status(500).json({
                    error: "Could not process payment",
                    code: ErrorCode.INTERNAL_ERROR,
                });
            }
        }
    };

    checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
        console.log('=== Checking Payment Status ===');
        console.log('Parameters:', req.params);
        
        try {
            const { orderId } = req.params;

            if (!orderId) {
                throw new ApplicationError(
                    "Order ID missing",
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }

            const status = await this.paymentService.getOrderDetails(orderId);
            logger.info("Payment status:", status);

            if (status.status === "completed" && req.body.deliveryDetails) {
                console.log('Payment completed, handling successful payment...');
                await this.handleSuccessfulPayment(
                    req.body.order,
                    orderId,
                    req.body.deliveryDetails
                );
            }

            res.json(status);
        } catch (error) {
            logger.error("Status check error:", error);
            res.status(500).json({
                error: "Could not check payment status",
                code: ErrorCode.INTERNAL_ERROR,
            });
        }
    };

    handleWebhook = async (req: Request, res: Response): Promise<void> => {
        console.log('=== Handling Payment Webhook ===');
        try {
            const { eventType, orderId, order, deliveryDetails } = req.body;
            logger.info("Payment webhook received", {
                eventType,
                orderId,
                body: req.body,
            });

            res.status(200).json({ received: true });

            if (eventType === "payment.completed" && orderId) {
                console.log('Processing completed payment webhook...');
                const status = await this.paymentService.getOrderDetails(orderId);

                if (status.status === "completed" && deliveryDetails && order) {
                    await this.handleSuccessfulPayment(
                        order,
                        orderId,
                        deliveryDetails
                    );
                }
            }
        } catch (error) {
            logger.error("Webhook handling error:", {
                error,
                body: req.body,
            });
        }
    };

    private validatePaymentRequest(body: any): boolean {
        return Boolean(
            body &&
                body.deliveryDetails &&
                body.order &&
                typeof body.totalAmount === "number" &&
                body.totalAmount > 0
        );
    }
}

export default new PaymentController();
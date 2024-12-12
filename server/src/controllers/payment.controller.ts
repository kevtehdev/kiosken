import { Request, Response } from "express";
import { logger } from "../utils/logger";
import PaymentService from "../services/payment.service";
import { OnslipService } from "../services/onslip.service";
import { DeliveryService } from "../services/delivery.service";
import { ApplicationError, ErrorCode } from '../middleware/error.middleware';
import { DeliveryDetails } from '../types/delivery.types';

export class PaymentController {
    private paymentService: typeof PaymentService;
    private onslipService: OnslipService;
    private deliveryService: DeliveryService;

    constructor() {
        this.paymentService = PaymentService;
        this.onslipService = OnslipService.getInstance();
        this.deliveryService = new DeliveryService();
    }

    processPayment = async (req: Request, res: Response): Promise<void> => {
        console.log('=== Processing payment request ===');
        console.log('Request body:', req.body);

        try {
            if (!this.validatePaymentRequest(req.body)) {
                throw new ApplicationError(
                    'Invalid payment request',
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }

            const { deliveryDetails, order, totalAmount } = req.body;

            // Create order in Onslip first
            await this.onslipService.addOrder(order);
            logger.info('Order added to Onslip', { orderId: deliveryDetails.orderId });

            // Process the delivery order
            await this.deliveryService.processNewOrder(deliveryDetails);

            // Create Smart Checkout payment order
            const paymentResult = await this.paymentService.createSmartCheckoutOrder(
                totalAmount,
                deliveryDetails.orderId
            );

            logger.info('Payment result:', paymentResult);

            if (!paymentResult.checkoutUrl) {
                throw new ApplicationError(
                    'No checkout URL received from payment provider',
                    500,
                    ErrorCode.INTEGRATION_ERROR
                );
            }

            res.json({
                status: paymentResult.status,
                message: paymentResult.message,
                transactionId: paymentResult.transactionId,
                checkoutUrl: paymentResult.checkoutUrl
            });

        } catch (error) {
            logger.error('Payment processing error:', error);
            if (error instanceof ApplicationError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code
                });
            } else {
                res.status(500).json({
                    error: "Could not process payment",
                    code: ErrorCode.INTERNAL_ERROR
                });
            }
        }
    };

    checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { orderId } = req.params;
            
            if (!orderId) {
                throw new ApplicationError(
                    'Order ID missing',
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }

            const status = await this.paymentService.getOrderDetails(orderId);
            logger.info('Payment status:', status);

            if (status.status === 'completed' && req.body.deliveryDetails) {
                await this.deliveryService.sendPaymentConfirmation(
                    req.body.deliveryDetails,
                    orderId
                );
            }

            res.json(status);
        } catch (error) {
            logger.error('Status check error:', error);
            res.status(500).json({
                error: "Could not check payment status",
                code: ErrorCode.INTERNAL_ERROR
            });
        }
    };

    handleWebhook = async (req: Request, res: Response): Promise<void> => {
        try {
            const { eventType, orderId } = req.body;
            logger.info('Payment webhook received', { 
                eventType, 
                orderId,
                body: req.body 
            });

            res.status(200).json({ received: true });

            if (eventType === 'payment.completed' && orderId) {
                const status = await this.paymentService.getOrderDetails(orderId);
                
                if (status.status === 'completed' && req.body.deliveryDetails) {
                    await this.deliveryService.sendPaymentConfirmation(
                        req.body.deliveryDetails,
                        orderId
                    );

                    logger.info('Payment confirmation sent', { 
                        orderId,
                        eventType 
                    });
                }
            }
        } catch (error) {
            logger.error('Webhook handling error:', {
                error,
                body: req.body
            });
        }
    };

    private validatePaymentRequest(body: any): boolean {
        return Boolean(
            body &&
            body.deliveryDetails &&
            body.order &&
            typeof body.totalAmount === 'number' &&
            body.totalAmount > 0
        );
    }
}

export default new PaymentController();
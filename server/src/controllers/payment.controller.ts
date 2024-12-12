import { Request, Response } from "express";
import { logger } from "../utils/logger";
import PaymentService from "../services/payment.service";
import { OnslipService } from "../services/onslip.service";
import { DeliveryService } from "../services/delivery.service";
import { ApplicationError, ErrorCode } from '../middleware/error.middleware';
import { DeliveryDetails, OrderItem } from '../types/delivery.types';

export class PaymentController {
    private paymentService: typeof PaymentService;
    private onslipService: OnslipService;
    private deliveryService: DeliveryService;

    constructor() {
        this.paymentService = PaymentService;
        this.onslipService = OnslipService.getInstance();
        this.deliveryService = new DeliveryService();
    }

    private validatePaymentRequest(body: any): boolean {
        return Boolean(
            body &&
            body.deliveryDetails &&
            body.order &&
            typeof body.totalAmount === 'number' &&
            body.totalAmount > 0
        );
    }

    private transformOrderItems(orderItems: any[]): OrderItem[] {
        if (!Array.isArray(orderItems)) return [];
        
        return orderItems.map(item => ({
            id: item.product?.toString() || '',
            name: item['product-name'] || item.name || '',
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            totalPrice: (Number(item.quantity) || 0) * (Number(item.price) || 0)
        }));
    }

    processPayment = async (req: Request, res: Response): Promise<void> => {
        console.log('=== Processar betalning ===');
        console.log('Request body:', req.body);

        try {
            if (!this.validatePaymentRequest(req.body)) {
                throw new ApplicationError(
                    'Ogiltig betalningsförfrågan',
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }

            const { deliveryDetails, order, totalAmount } = req.body;
            const orderItems = this.transformOrderItems(order.items);

            const updatedDeliveryDetails: DeliveryDetails = {
                ...deliveryDetails,
                items: orderItems,
                created: new Date(),
            };

            // Lägg till order i Onslip
            await this.onslipService.addOrder(order);
            logger.info('Order tillagd i Onslip', { 
                orderId: updatedDeliveryDetails.orderId 
            });

            // Initiera orderprocessen
            await this.deliveryService.processNewOrder(updatedDeliveryDetails);

            // Initiera betalning
            const paymentStatus = await this.paymentService.processCardPayment(
                totalAmount,
                updatedDeliveryDetails.orderId
            );

            logger.info('Betalning initierad', {
                orderId: updatedDeliveryDetails.orderId,
                status: paymentStatus.status
            });

            res.json(paymentStatus);
        } catch (error) {
            logger.error('Fel vid betalningsprocessing', { error });
            if (error instanceof ApplicationError) {
                res.status(error.status).json({ 
                    error: error.message,
                    code: error.code 
                });
            } else {
                res.status(500).json({ 
                    error: "Kunde inte processa betalningen",
                    code: ErrorCode.INTERNAL_ERROR
                });
            }
        }
    };

    checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
        console.log('=== Kontrollerar betalningsstatus ===');
        const { orderId } = req.params;
        
        try {
            if (!orderId) {
                throw new ApplicationError(
                    'Order ID saknas',
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }

            const status = await this.paymentService.checkPaymentStatus(orderId);
            
            if (status.status === 'completed' && status.transactionId) {
                const { deliveryDetails } = req.body;
                const updatedDeliveryDetails: DeliveryDetails = {
                    ...deliveryDetails,
                    created: deliveryDetails.created || new Date(),
                    items: this.transformOrderItems(deliveryDetails.items || [])
                };

                await this.deliveryService.sendPaymentConfirmation(
                    updatedDeliveryDetails,
                    status.transactionId
                );
            }

            res.json(status);
        } catch (error) {
            logger.error('Fel vid statuskontroll', { error });
            if (error instanceof ApplicationError) {
                res.status(error.status).json({ 
                    error: error.message,
                    code: error.code 
                });
            } else {
                res.status(500).json({ 
                    error: "Kunde inte kontrollera betalningsstatus",
                    code: ErrorCode.INTERNAL_ERROR
                });
            }
        }
    };

    handleWebhook = async (req: Request, res: Response): Promise<void> => {
        console.log('=== Hanterar betalnings-webhook ===');
        const { eventType, orderId, transactionId } = req.body;

        try {
            // Bekräfta mottagning av webhook
            res.status(200).json({ received: true });

            if (eventType === 'payment.completed' && orderId) {
                logger.info('Betalning genomförd via webhook', { orderId, transactionId });

                // Hämta orderdetaljer och skicka bekräftelser
                const { deliveryDetails } = req.body;
                if (deliveryDetails) {
                    const updatedDeliveryDetails: DeliveryDetails = {
                        ...deliveryDetails,
                        created: deliveryDetails.created || new Date(),
                        items: this.transformOrderItems(deliveryDetails.items || [])
                    };

                    await this.deliveryService.sendPaymentConfirmation(
                        updatedDeliveryDetails,
                        transactionId
                    );
                }
            }
        } catch (error) {
            logger.error('Fel vid webhook-hantering', { error });
            // Vi svarar redan 200 OK för att undvika återförsök
        }
    };
}

export default new PaymentController();
import { Request, Response } from "express";
import { logger } from "../utils/logger";
import PaymentService from "../services/payment.service";
import { OnslipService } from "../services/onslip.service";
import { DeliveryService } from "../services/delivery.service";
import { ApplicationError, ErrorCode } from '../middleware/error.middleware';

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
        try {
            const { deliveryDetails, order, totalAmount } = req.body;

            // 1. Lägg till order i Onslip
            await this.onslipService.addOrder(order);
            logger.info('Order added to Onslip', { 
                orderId: deliveryDetails.orderId 
            });

            // 2. Initiera orderprocessen
            await this.deliveryService.processNewOrder({
                ...deliveryDetails,
                paymentMethod: 'card'  // Default till kortbetalning
            });

            // 3. Initiera betalning på terminal
            const paymentStatus = await this.paymentService.processCardPayment(
                totalAmount,
                deliveryDetails.orderId
            );

            logger.info('Payment initiated', {
                orderId: deliveryDetails.orderId,
                status: paymentStatus.status
            });

            res.json(paymentStatus);
        } catch (error) {
            logger.error('Payment processing error', { error });
            if (error instanceof ApplicationError) {
                res.status(error.status).json({ error: error.message });
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
            const status = await this.paymentService.checkPaymentStatus(orderId);

            if (status.status === 'completed') {
                const { deliveryDetails } = req.body;
                await this.deliveryService.sendPaymentConfirmation(
                    deliveryDetails,
                    status.transactionId!
                );
            }

            res.json(status);
        } catch (error) {
            logger.error('Payment status check failed', { error });
            res.status(500).json({ 
                error: "Could not check payment status",
                code: ErrorCode.INTERNAL_ERROR
            });
        }
    };

    handleTerminalCallback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { orderId, status, transactionId } = req.body;
            logger.info('Terminal callback received', { orderId, status });

            // Acknowledge callback receipt
            res.status(200).json({ received: true });

            // Process callback asynchronously
            if (status === 'completed') {
                // Fetch order details and send confirmation
                // Implementation depends on how you store order details
            }
        } catch (error) {
            logger.error('Terminal callback processing failed', { error });
            res.status(500).json({ 
                error: "Could not process terminal callback",
                code: ErrorCode.INTERNAL_ERROR
            });
        }
    };
}

export default new PaymentController();
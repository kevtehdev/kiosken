import { Request, Response } from 'express';
import { DeliveryService, DeliveryDetails } from '../services/delivery.service';
import { logger } from '../utils/logger';
import { ApplicationError } from '../middleware/error.middleware';

export class DeliveryController {
    private deliveryService: DeliveryService;

    constructor() {
        this.deliveryService = new DeliveryService();
    }

    processNewOrder = async (req: Request, res: Response) => {
        try {
            const deliveryDetails: DeliveryDetails = req.body;

            if (!this.validateDeliveryDetails(deliveryDetails)) {
                throw new ApplicationError('Invalid delivery details', 400);
            }

            await this.deliveryService.processNewOrder(deliveryDetails);

            logger.info('New order processed successfully', {
                orderId: deliveryDetails.orderId
            });

            res.status(200).json({
                message: 'Order processed successfully',
                orderId: deliveryDetails.orderId
            });
        } catch (error) {
            logger.error('Failed to process new order', { error });
            res.status(error instanceof ApplicationError ? error.status : 500)
               .json({ error: error instanceof Error ? error.message : 'Failed to process order' });
        }
    };

    sendPaymentReceipt = async (req: Request, res: Response) => {
        try {
            const { deliveryDetails, transactionId } = req.body;

            await this.deliveryService.sendPaymentConfirmation(
                deliveryDetails,
                transactionId
            );

            logger.info('Payment receipt sent', {
                orderId: deliveryDetails.orderId,
                transactionId
            });

            res.status(200).json({ 
                message: 'Payment receipt sent successfully' 
            });
        } catch (error) {
            logger.error('Failed to send payment receipt', { error });
            res.status(500).json({ 
                error: 'Could not send payment receipt' 
            });
        }
    };

    private validateDeliveryDetails(details: any): details is DeliveryDetails {
        return Boolean(
            details &&
            details.orderId &&
            details.orderName &&
            details.customerName &&
            details.customerEmail &&
            details.deliveryLocation &&
            details.totalAmount &&
            Array.isArray(details.items) &&
            details.items.length > 0 &&
            details.paymentMethod
        );
    }
}
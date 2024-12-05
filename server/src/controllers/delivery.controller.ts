import { Request, Response } from 'express';
import { DeliveryService, DeliveryDetails } from '../services/delivery.service';

export class DeliveryController {
    private deliveryService: DeliveryService;

    constructor() {
        this.deliveryService = new DeliveryService();
    }

    getDeliveryStaff = async (req: Request, res: Response) => {
        try {
            const staff = await this.deliveryService.getDeliveryStaff();
            if (staff) {
                res.json(staff);
            } else {
                res.status(404).json({ error: 'Leveranspersonal hittades inte' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte hämta leveranspersonal' });
        }
    };

    createDeliveryTags = (req: Request, res: Response) => {
        try {
            const { resourceId } = req.params;
            const tags = this.deliveryService.createDeliveryTags(Number(resourceId));
            res.json({ tags });
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte skapa leveranstagg' });
        }
    };

    sendOrderNotifications = async (req: Request, res: Response) => {
        try {
            const deliveryDetails: DeliveryDetails = req.body;
            
            await Promise.all([
                this.deliveryService.sendCustomerOrderConfirmation(deliveryDetails),
                this.deliveryService.sendDeliveryStaffNotification(deliveryDetails)
            ]);

            res.json({ message: 'Notifieringar skickade' });
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte skicka notifieringar' });
        }
    };

    sendPaymentConfirmation = async (req: Request, res: Response) => {
        try {
            const { deliveryDetails, transactionId } = req.body;
            await this.deliveryService.sendPaymentConfirmation(deliveryDetails, transactionId);
            res.json({ message: 'Betalningsbekräftelse skickad' });
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte skicka betalningsbekräftelse' });
        }
    };
}

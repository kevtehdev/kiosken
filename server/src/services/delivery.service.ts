import { API } from "@onslip/onslip-360-node-api";
import { OnslipService } from "./onslip.service";
import { OnslipCustomerExtended } from '../types/onslip.types';
import { logger } from '../utils/logger';
import { ApplicationError, ErrorCode } from '../middleware/error.middleware';

export interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: string[];
    paymentMethod: 'card' | 'swish';
    deliveryNotes?: string;
}

export class DeliveryService {
    private onslipService: OnslipService;
    private DELIVERY_STAFF_ID = 1;

    constructor() {
        this.onslipService = new OnslipService();
    }

    async processNewOrder(details: DeliveryDetails): Promise<void> {
        try {
            logger.info('Processing new order', { 
                orderId: details.orderId,
                customerName: details.customerName 
            });

            await this.sendOrderConfirmation(details);
            logger.info('Order confirmation sent to customer', { orderId: details.orderId });

            await this.sendDeliveryStaffNotification(details);
            logger.info('Delivery staff notified', { orderId: details.orderId });

        } catch (error) {
            logger.error('Failed to process new order', {
                error,
                orderId: details.orderId
            });
            throw new ApplicationError(
                'Could not process order',
                500,
                ErrorCode.INTERNAL_ERROR
            );
        }
    }

    async getDeliveryStaff(): Promise<OnslipCustomerExtended | null> {
        try {
            const staff = await this.onslipService.getCustomer(
                this.DELIVERY_STAFF_ID
            );
            if (staff) {
                logger.info('Delivery staff found', {
                    staffId: this.DELIVERY_STAFF_ID,
                    staffName: staff.name
                });
                return staff;
            }
            logger.error('Delivery staff not found', {
                staffId: this.DELIVERY_STAFF_ID
            });
            return null;
        } catch (error) {
            logger.error("Error fetching delivery staff", { 
                error,
                staffId: this.DELIVERY_STAFF_ID
            });
            throw new ApplicationError(
                'Could not fetch delivery staff',
                500,
                ErrorCode.INTERNAL_ERROR
            );
        }
    }

    createDeliveryTags(resourceId: number): string[] {
        return [
            `delivery_desk:${resourceId}`,
            `delivery_staff:${this.DELIVERY_STAFF_ID}`,
        ];
    }

    private formatOrderDetails(details: DeliveryDetails): string {
        return `
Orderdetaljer:
Order ID: ${details.orderId}
Beställare: ${details.customerName}
Leveransplats: ${details.deliveryLocation}

Produkter:
${details.items.join("\n")}

Totalt belopp: ${details.totalAmount} kr
${details.deliveryNotes ? `\nLeveransnoteringar: ${details.deliveryNotes}` : ''}
`;
    }

    async sendEmail(
        recipientEmail: string,
        subject: string,
        message: string
    ): Promise<void> {
        try {
            const command: API.Command = {
                name: "send-email",
                args: [
                    "noreply@onslip.com",
                    recipientEmail,
                    subject,
                    "text/plain",
                    message,
                ],
            };

            await this.onslipService.doCommand(command);
            logger.info('Email sent successfully', {
                recipient: recipientEmail,
                subject
            });
        } catch (error) {
            logger.error("Failed to send email", {
                error,
                recipient: recipientEmail,
                subject
            });
            throw new ApplicationError(
                'Could not send email',
                500,
                ErrorCode.INTERNAL_ERROR
            );
        }
    }

    async sendOrderConfirmation(details: DeliveryDetails): Promise<void> {
        try {
            await this.sendEmail(
                details.customerEmail,
                `Orderbekräftelse: ${details.orderName}`,
                `
Hej ${details.customerName}!

Din beställning är mottagen och väntar på betalning vid leverans.

${this.formatOrderDetails(details)}

Betalningsinformation:
- Betalning sker med ${details.paymentMethod} vid leverans
- Summa att betala: ${details.totalAmount} kr

Vi ser fram emot att leverera din beställning!

Med vänliga hälsningar,
Teamet på Onslip`
            );
        } catch (error) {
            throw new ApplicationError(
                'Failed to send order confirmation',
                500,
                ErrorCode.INTEGRATION_ERROR
            );
        }
    }

    async sendDeliveryStaffNotification(
        details: DeliveryDetails
    ): Promise<void> {
        const staff = await this.getDeliveryStaff();
        if (!staff?.email) {
            throw new ApplicationError(
                "Kunde inte hitta e-postadress för leveranspersonal",
                500,
                ErrorCode.NOT_FOUND
            );
        }

        try {
            await this.sendEmail(
                staff.email,
                `Ny order att hantera: ${details.orderName}`,
                `
Hej!

En ny order har inkommit och väntar på leverans.

${this.formatOrderDetails(details)}

Betalningsinformation:
- Betalning sker med ${details.paymentMethod} vid leverans
- Summa att ta betalt: ${details.totalAmount} kr

Var god leverera ordern till angiven adress.

Med vänliga hälsningar,
Teamet på Onslip`
            );
        } catch (error) {
            throw new ApplicationError(
                'Failed to send staff notification',
                500,
                ErrorCode.INTEGRATION_ERROR
            );
        }
    }

    async sendPaymentConfirmation(
        details: DeliveryDetails,
        transactionId: string
    ): Promise<void> {
        try {
            await this.sendEmail(
                details.customerEmail,
                `Kvitto för order: ${details.orderName}`,
                `
Hej ${details.customerName}!

Tack för din betalning! Här kommer ditt kvitto.

${this.formatOrderDetails(details)}

Betalningsinformation:
- Transaktions-ID: ${transactionId}
- Betalningsmetod: ${details.paymentMethod}
- Betalt belopp: ${details.totalAmount} kr

Tack för att du handlar hos oss!

Med vänliga hälsningar,
Teamet på Onslip`
            );

            const staff = await this.getDeliveryStaff();
            if (staff?.email) {
                await this.sendEmail(
                    staff.email,
                    `Betalning bekräftad för order: ${details.orderName}`,
                    `
Hej!

Betalningen har nu genomförts för följande order:

${this.formatOrderDetails(details)}

Transaktions-ID: ${transactionId}

Ordern är nu klar att levereras.

Med vänliga hälsningar,
Teamet på Onslip`
                );
            }
        } catch (error) {
            throw new ApplicationError(
                'Failed to send payment confirmation',
                500,
                ErrorCode.INTEGRATION_ERROR
            );
        }
    }
}

export default new DeliveryService();
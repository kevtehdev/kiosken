import { API } from "@onslip/onslip-360-web-api";
import { OnslipService } from "./onslip.service";
import { OnslipCustomer } from "../types";

export interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: string[];
}

export class DeliveryService {
    private onslipService: OnslipService;
    private DELIVERY_STAFF_ID = 1;

    constructor() {
        this.onslipService = new OnslipService();
    }

    async getDeliveryStaff(): Promise<OnslipCustomer | null> {
        try {
            const staff = await this.onslipService.getCustomer(
                this.DELIVERY_STAFF_ID
            );
            if (staff) {
                console.log(
                    `Tilldelad leveranspersonal: ${staff.name} (Employee ID: ${this.DELIVERY_STAFF_ID})`
                );
                return staff;
            }
            console.error(
                `Leveranspersonal (ID ${this.DELIVERY_STAFF_ID}) hittades inte`
            );
            return null;
        } catch (error) {
            console.error("Fel vid hämtning av leveranspersonal:", error);
            return null;
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
            console.log(`E-post skickad till: ${recipientEmail}`);
        } catch (error) {
            console.error("Fel vid skickande av e-post:", error);
            throw error;
        }
    }

    async sendCustomerOrderConfirmation(
        details: DeliveryDetails
    ): Promise<void> {
        await this.sendEmail(
            details.customerEmail,
            `Orderbekräftelse: ${details.orderName}`,
            `
Hej!

Din beställning är mottagen och behandlas nu.

${this.formatOrderDetails(details)}

Med vänliga hälsningar,
Teamet på Onslip`
        );
    }

    async sendDeliveryStaffNotification(
        details: DeliveryDetails
    ): Promise<void> {
        const staff = await this.getDeliveryStaff();
        if (!staff?.email) {
            throw new Error(
                "Kunde inte hitta e-postadress för leveranspersonal"
            );
        }

        await this.sendEmail(
            staff.email,
            `Ny leverans att hantera: ${details.orderName}`,
            `
Hej!

En ny leverans väntar på din hantering.

${this.formatOrderDetails(details)}

Med vänliga hälsningar,
Teamet på Onslip`
        );
    }

    async sendPaymentConfirmation(
        details: DeliveryDetails,
        transactionId: string
    ): Promise<void> {
        await this.sendEmail(
            details.customerEmail,
            `Betalningsbekräftelse: ${details.orderName}`,
            `
Hej!

Vi bekräftar att betalningen har genomförts.

Transaktions-ID: ${transactionId}

${this.formatOrderDetails(details)}

Tack för ditt köp!

Med vänliga hälsningar,
Teamet på Onslip`
        );
    }
}

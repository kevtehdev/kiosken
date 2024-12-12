import { API } from "@onslip/onslip-360-node-api";
import { OnslipService } from "./onslip.service";
import { logger } from "../utils/logger";
import { ApplicationError, ErrorCode } from "../middleware/error.middleware";
import {
    DeliveryDetails,
    OrderItem,
    DeliveryStaffInfo,
    DeliveryNotification,
    DeliveryStatus,
} from "../types/delivery.types";

export class DeliveryService {
    private onslipService: OnslipService;
    private DELIVERY_STAFF_ID = 1; // Rätt ska vara ID = 6 för Dino i produktion.

    constructor() {
        this.onslipService = OnslipService.getInstance();
    }

    async processNewOrder(details: DeliveryDetails): Promise<void> {
        console.log("=== Processar ny order ===");
        console.log("Orderdetaljer:", details);

        try {
            this.validateOrderDetails(details);
            await this.sendOrderConfirmation(details);
            console.log(
                "Orderbekräftelse skickad till kund:",
                details.customerEmail
            );

            await this.sendDeliveryStaffNotification(details);
            console.log("Personal notifierad för order:", details.orderId);
        } catch (error) {
            console.error("Fel vid orderprocessing:", error);
            throw new ApplicationError(
                "Kunde inte processa ordern",
                500,
                ErrorCode.INTERNAL_ERROR
            );
        }
    }

    async getDeliveryStaff(): Promise<DeliveryStaffInfo | null> {
        console.log("=== Hämtar leveranspersonal ===");
        console.log("Personal ID:", this.DELIVERY_STAFF_ID);

        try {
            const staff = await this.onslipService.getCustomer(
                this.DELIVERY_STAFF_ID
            );
            if (!staff) return null;

            const staffInfo: DeliveryStaffInfo = {
                id: this.DELIVERY_STAFF_ID,
                name: staff.name,
                email: staff.email || "",
                status: "available",
            };

            console.log("Personaldetaljer:", staffInfo);
            return staffInfo;
        } catch (error) {
            console.error("Fel vid hämtning av personal:", error);
            throw new ApplicationError(
                "Kunde inte hämta leveranspersonal",
                500,
                ErrorCode.INTERNAL_ERROR
            );
        }
    }

    private validateOrderDetails(details: DeliveryDetails): void {
        if (
            !details.items ||
            !Array.isArray(details.items) ||
            details.items.length === 0
        ) {
            throw new ApplicationError(
                "Orderdetaljer saknar produkter",
                400,
                ErrorCode.VALIDATION_ERROR
            );
        }

        details.items.forEach((item, index) => {
            if (!this.isValidOrderItem(item)) {
                throw new ApplicationError(
                    `Ogiltig produkt på position ${index + 1}`,
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }
        });
    }

    private isValidOrderItem(item: any): item is OrderItem {
        return Boolean(
            item &&
                typeof item.name === "string" &&
                typeof item.quantity === "number" &&
                typeof item.price === "number" &&
                typeof item.totalPrice === "number"
        );
    }

    private formatOrderDetails(details: DeliveryDetails): string {
        const formattedItems = details.items
            .map(
                (item) =>
                    `${item.quantity}x ${item.name} (${item.price.toFixed(
                        2
                    )} kr/st) - Totalt: ${item.totalPrice.toFixed(2)} kr`
            )
            .join("\n");

        const orderDate = details.created
            ? new Date(details.created).toLocaleString()
            : new Date().toLocaleString();

        const formattedDetails = `
Orderdetaljer:
Beställningsnummer: ${details.orderId}
Beställare: ${details.customerName}
Leveransplats: ${details.deliveryLocation}

Produkter:
${formattedItems}

Totalt belopp: ${details.totalAmount.toFixed(2)} kr
${details.deliveryNotes ? `\nLeveransnoteringar: ${details.deliveryNotes}` : ""}
Orderdatum: ${orderDate}`;

        console.log("Formaterade orderdetaljer:", formattedDetails);
        return formattedDetails;
    }

    async sendEmail(
        recipientEmail: string,
        subject: string,
        message: string
    ): Promise<void> {
        console.log("=== Skickar email ===");
        console.log("Till:", recipientEmail);
        console.log("Ämne:", subject);
        console.log("Meddelande:", message);

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
            console.log("Email skickat");
        } catch (error) {
            console.error("Fel vid emailutskick:", error);
            throw new ApplicationError(
                "Kunde inte skicka email",
                500,
                ErrorCode.INTERNAL_ERROR
            );
        }
    }

    async sendDeliveryStaffNotification(
        details: DeliveryDetails
    ): Promise<void> {
        console.log("=== Skickar personalnotifiering ===");
        const staff = await this.getDeliveryStaff();

        if (!staff?.email) {
            throw new ApplicationError(
                "Kunde inte hitta e-postadress för leveranspersonal",
                500,
                ErrorCode.NOT_FOUND
            );
        }

        try {
            const notification: DeliveryNotification = {
                type: "order_confirmation",
                recipient: staff.email,
                details: details,
            };

            const message = `
Hej ${staff.name}!

En ny order har inkommit och väntar på leverans.

${this.formatOrderDetails(details)}

Betalningsinformation:
- Summa att leverera för: ${details.totalAmount.toFixed(2)} kr

Var god leverera ordern till angiven adress.

Med vänliga hälsningar,
Teamet på Onslip`;

            await this.sendEmail(
                staff.email,
                `Ny order att hantera: ${details.orderName}`,
                message
            );

            console.log("Personalnotifiering skickad");
        } catch (error) {
            console.error("Fel vid personalnotifiering:", error);
            throw new ApplicationError(
                "Kunde inte skicka personalnotifiering",
                500,
                ErrorCode.INTEGRATION_ERROR
            );
        }
    }

    async sendOrderConfirmation(details: DeliveryDetails): Promise<void> {
        console.log("=== Skickar orderbekräftelse ===");
        try {
            const notification: DeliveryNotification = {
                type: "order_confirmation",
                recipient: details.customerEmail,
                details: details,
            };

            const message = `
Hej ${details.customerName}!

Din beställning är mottagen och betalning initieras.

${this.formatOrderDetails(details)}

Betalningsinformation:
- Summa att betala: ${details.totalAmount.toFixed(2)} kr

Vi ser fram emot att leverera din beställning!

Med vänliga hälsningar,
Teamet på Onslip`;

            await this.sendEmail(
                details.customerEmail,
                `Orderbekräftelse: ${details.orderName}`,
                message
            );

            console.log("Orderbekräftelse skickad");
        } catch (error) {
            console.error("Fel vid orderbekräftelse:", error);
            throw new ApplicationError(
                "Kunde inte skicka orderbekräftelse",
                500,
                ErrorCode.INTEGRATION_ERROR
            );
        }
    }

    async sendPaymentConfirmation(
        details: DeliveryDetails,
        transactionId: string
    ): Promise<void> {
        console.log("=== Skickar betalningsbekräftelse ===");
        console.log("Transaktions-ID:", transactionId);

        try {
            const notification: DeliveryNotification = {
                type: "payment_receipt",
                recipient: details.customerEmail,
                details: details,
                transactionId: transactionId,
            };

            const customerMessage = `
Hej ${details.customerName}!

Tack för din betalning! Här kommer ditt kvitto.

${this.formatOrderDetails(details)}

Betalningsinformation:
- Transaktions-ID: ${transactionId}
- Betalt belopp: ${details.totalAmount.toFixed(2)} kr

Tack för att du handlar hos oss!

Med vänliga hälsningar,
Teamet på Onslip`;

            await this.sendEmail(
                details.customerEmail,
                `Kvitto för order: ${details.orderName}`,
                customerMessage
            );

            console.log("Betalningsbekräftelse skickad till kund");

            const staff = await this.getDeliveryStaff();
            if (staff?.email) {
                const staffMessage = `
Hej ${staff.name}!

Betalningen har nu genomförts för följande order:

${this.formatOrderDetails(details)}

Transaktions-ID: ${transactionId}

Ordern är nu klar att levereras.

Med vänliga hälsningar,
Teamet på Onslip`;

                await this.sendEmail(
                    staff.email,
                    `Betalning bekräftad för order: ${details.orderName}`,
                    staffMessage
                );
                console.log("Betalningsbekräftelse skickad till personal");
            }
        } catch (error) {
            console.error("Fel vid betalningsbekräftelse:", error);
            throw new ApplicationError(
                "Kunde inte skicka betalningsbekräftelse",
                500,
                ErrorCode.INTEGRATION_ERROR
            );
        }
    }
}

export default new DeliveryService();

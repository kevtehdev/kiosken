import { Request, Response } from "express";
import PaymentService from "../services/payment.service";

export class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    processPayment = async (req: Request, res: Response) => {
        try {
            const { deliveryDetails } = req.body;

            const amount = deliveryDetails.totalAmount;
            const orderId = deliveryDetails.orderId;

            if (!this.validatePaymentInfo(amount, orderId)) {
                return res
                    .status(400)
                    .json({ error: "Ogiltig betalningsinformation" });
            }

            const paymentStatus = await this.paymentService.processPayment(
                amount,
                orderId
            );
            res.json(paymentStatus);
        } catch (error) {
            res.status(500).json({ error: "Kunde inte processa betalningen" });
        }
    };

    private validatePaymentInfo(amount: number, orderId: string): boolean {
        if (amount <= 0) {
            console.error("Ogiltigt belopp:", amount);
            return false;
        }

        if (!orderId) {
            console.error("Order-ID saknas");
            return false;
        }

        return true;
    }
}

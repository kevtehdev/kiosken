import { Request, Response } from "express";
import { OnslipService } from "../services/onslip.service";

export class CustomerController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = OnslipService.getInstance();
    }

    getCustomers = async (req: Request, res: Response) => {
        try {
            const customers = await this.onslipService.listCustomers();

            res.json(customers);
        } catch (error) {
            res.status(500).json({ error: "Kunde inte hämta användare" });
        }
    };

    getCustomer = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const customer = await this.onslipService.getCustomer(Number(id));
            if (customer) {
                res.json(customer);
            } else {
                res.status(404).json({ error: "Användare hittades inte" });
            }
        } catch (error) {
            res.status(500).json({ error: "Kunde inte hämta användare" });
        }
    };
}

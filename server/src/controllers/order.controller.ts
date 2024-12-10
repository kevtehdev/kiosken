import { Request, Response } from "express";
import { OnslipService } from "../services/onslip.service";
import { Resource } from "../types";
import { API } from "@onslip/onslip-360-node-api";

export class OrderController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = OnslipService.getInstance();
    }

    calcTotalDiscount = async (req: Request, res: Response) => {
        try {
            const data: API.Item[] = req.body;

            const result = await this.onslipService.calcTotal(data);

            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                error: "Kunde inte räkna ut total rabatt ",
            });
        }
    };
}

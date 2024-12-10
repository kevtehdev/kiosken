import { Request, Response } from "express";
import { OnslipService } from "../services/onslip.service";
import { API } from "@onslip/onslip-360-node-api";

export class StockController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = new OnslipService();
    }

    listStockBalance = async (req: Request, res: Response) => {
        try {
            const { location, query }: { location: number; query: string } =
                req.body;

            console.log(location, typeof location);
            console.log(query, typeof query);

            const result = await this.onslipService.listStockBalance(
                location,
                query
            );

            res.status(201).json(result);
        } catch (error) {
            console.log(error);

            res.status(500).json({
                error: "Kunde inte hitta lagerstatus",
            });
        }
    };
}

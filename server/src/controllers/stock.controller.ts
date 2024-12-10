import { Request, Response } from "express";
import { OnslipService } from "../services/onslip.service";

export class StockController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = new OnslipService();
    }

    listStockBalance = async (req: Request, res: Response) => {
        try {
            const { location, query }: { location: string; query: string } =
                req.body;

            const result = await this.onslipService.listStockBalance(
                Number(location),
                query
            );

            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                error: "Kunde inte hitta lagerstatus",
            });
        }
    };
}

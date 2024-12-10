import { Request, Response } from "express";
import { OnslipService } from "../services/onslip.service";
import { NodeRequestError } from "@onslip/onslip-360-node-api";

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
            if (error instanceof NodeRequestError) {
                error.data?.message;
                res.status(500).json({
                    error: "Kunde inte hitta lagerstatus",
                    data: error.data,
                });
            } else {
                res.status(500).json({
                    error: "Kunde inte hitta lagerstatus",
                });
            }
        }
    };
}

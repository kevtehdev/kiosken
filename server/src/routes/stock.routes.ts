import { Router } from "express";
import { StockController } from "../controllers/stock.controller";

const router = Router();
const stockController = new StockController();

router.post("/", stockController.listStockBalance);

export default router;

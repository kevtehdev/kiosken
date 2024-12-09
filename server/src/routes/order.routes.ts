import { Router } from "express";
import { OrderController } from "../controllers/order.controller";

const router = Router();
const orderController = new OrderController();

router.post("/calc-total-discount", orderController.calcTotalDiscount);

export default router;

import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import { validateSession } from "../middleware/validation.middleware";
import { logger } from "../utils/logger";

const router = Router();

router.post("/process", validateSession, PaymentController.processPayment);

router.get(
    "/status/:transactionId",
    validateSession,
    PaymentController.checkPaymentStatus
);

router.post("/webhook", PaymentController.handleWebhook);

export default router;

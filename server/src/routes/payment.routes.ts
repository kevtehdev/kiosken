import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validateSession } from '../middleware/validation.middleware';
import { logger } from '../utils/logger';

const router = Router();
const paymentController = new PaymentController();

// Process payment
router.post('/process', validateSession, paymentController.processPayment);

// Check payment status
router.get('/status/:orderId', validateSession, paymentController.checkPaymentStatus);

// Payment webhook endpoint
router.post('/webhook', paymentController.handleWebhook);

export default router;

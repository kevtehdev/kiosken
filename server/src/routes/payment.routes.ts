import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import { validateSession } from '../middleware/validation.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Process payment
router.post('/process', validateSession, PaymentController.processPayment);

// Check payment status
router.get('/status/:orderId', validateSession, PaymentController.checkPaymentStatus);

// Payment webhook endpoint
router.post('/webhook', PaymentController.handleWebhook);

export default router;
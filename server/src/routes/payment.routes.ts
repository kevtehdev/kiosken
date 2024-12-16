import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import { validateSession } from '../middleware/validation.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Existing routes
router.post('/process', validateSession, PaymentController.processPayment);
router.get('/status/:orderId', validateSession, PaymentController.checkPaymentStatus);
router.post('/webhook', PaymentController.handleWebhook);

// New route for journal entries
router.post('/orders/journal', validateSession, PaymentController.createJournalEntry);

export default router;
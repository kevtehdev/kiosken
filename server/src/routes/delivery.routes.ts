import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';
import { validateSession } from '../middleware/validation.middleware';

const router = Router();
const deliveryController = new DeliveryController();

// Process new order and notify staff
router.post('/orders', 
    validateSession, 
    deliveryController.processNewOrder
);

// Send payment receipt
router.post('/payment-receipt', 
    validateSession, 
    deliveryController.sendPaymentReceipt
);

export default router;
import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';

const router = Router();
const deliveryController = new DeliveryController();

router.get('/staff', deliveryController.getDeliveryStaff);
router.get('/tags/:resourceId', deliveryController.createDeliveryTags);
router.post('/notifications', deliveryController.sendOrderNotifications);
router.post('/payment-confirmation', deliveryController.sendPaymentConfirmation);

export default router;

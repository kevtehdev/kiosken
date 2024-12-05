import { Router, Request, Response } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post('/process', async (req: Request, res: Response) => {
    await paymentController.processPayment(req, res);
});

// Lägg till route för att kontrollera betalningsstatus
router.get('/status/:orderId', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        res.json({ orderId, status: 'pending' });
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte hämta betalningsstatus' });
    }
});

export default router;
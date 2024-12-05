import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

router.get('/customers', userController.getCustomers);
router.get('/customers/:id', userController.getCustomer);

export default router;  
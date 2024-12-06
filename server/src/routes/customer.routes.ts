import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();
const customerController = new CustomerController();

router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomer);

export default router;

import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';

const router = Router();
const resourceController = new ResourceController();

router.get('/', resourceController.getResources);
router.post('/', resourceController.createResource);

export default router;

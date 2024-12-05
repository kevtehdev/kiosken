import { Router } from 'express';
import { ButtonController } from '../controllers/button.controller';

const router = Router();
const buttonController = new ButtonController();

router.get('/maps', buttonController.getButtonMaps);
router.get('/api-data', buttonController.getApiData);

export default router;
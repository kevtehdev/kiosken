import { Router } from 'express';
import oauthController from '../controllers/oauth.controller';
import { validateSession } from '../middleware/validation.middleware';
import OnslipService from '../services/onslip.service';
import { logger } from '../utils/logger';
import { ApplicationError, ErrorCode } from '../middleware/error.middleware';

const router = Router();

/**
 * OAuth routes
 */
router.get('/authorize', validateSession, oauthController.authorize);
router.get('/callback', validateSession, oauthController.callback);

/**
 * Registering route
 */
router.post('/register', validateSession, async (req, res, next) => {
    try {
        const result = await OnslipService.registerIntegration();
        logger.info('Integration registered successfully');
        res.json(result);
    } catch (error) {
        logger.error('Integration registration failed', { error });
        next(new ApplicationError(
            'Kunde inte registrera integration',
            500,
            ErrorCode.INTEGRATION_ERROR,
            true,
            error instanceof Error ? error.message : undefined
        ));
    }
});

export default router;
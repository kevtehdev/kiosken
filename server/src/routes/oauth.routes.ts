import { Router } from 'express';
import oauthController from '../controllers/oauth.controller';
import { validateSession } from '../middleware/validation.middleware';
import OnslipService from '../services/onslip.service';

const router = Router();

/**
 * @route   GET /api/oauth/authorize
 * @desc    Initierar OAuth-flödet och genererar auktoriserings-URL
 * @access  Public
 */
router.get('/authorize', validateSession, oauthController.authorize.bind(oauthController));

/**
 * @route   GET /api/oauth/callback
 * @desc    Callback endpoint för OAuth-flödet
 * @access  Public
 */
router.get('/callback', validateSession, oauthController.callback.bind(oauthController));

/**
 * @route   POST /api/oauth/register
 * @desc    Registrerar integrationen med Onslip
 * @access  Public
 */
router.post('/register', async (req, res) => {
    const onslipServiceInstance = OnslipService;
    try {
        const result = await onslipServiceInstance.registerIntegration();
        res.json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Kunde inte registrera integration',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

export default router;
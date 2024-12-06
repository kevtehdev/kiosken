import { Request, Response } from 'express';
import { OnslipService } from '../services/onslip.service';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

export class OAuthController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = OnslipService.getInstance();
    }

    /**
     * Initierar OAuth-flödet
     */
    public authorize = async (req: Request, res: Response): Promise<void> => {
        try {
            logger.info('Initiating OAuth authorization flow');
            const { authorizationUrl, codeVerifier } = await this.onslipService.generateAuthorizationUrl();

            // Spara code_verifier i session
            req.session.oauth = {
                codeVerifier,
                state: req.query.state as string
            };

            await req.session.save();
            logger.info('Generated authorization URL and saved verifier to session');

            res.json({ authorizationUrl });
        } catch (error) {
            logger.error('OAuth authorization error:', error);
            res.status(500).json({ 
                error: 'Ett fel uppstod vid OAuth-auktorisering',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };

    /**
     * Hanterar OAuth callback och token utbyte
     */
    public callback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { code, error, error_description } = req.query;
            const oauthSession = req.session.oauth;

            logger.info('Received OAuth callback', { code: !!code, error, sessionExists: !!oauthSession });

            // Kontrollera om auktoriseringen misslyckades
            if (error) {
                throw new Error(`OAuth error: ${error} - ${error_description}`);
            }

            // Validera nödvändiga parametrar
            if (!code || !oauthSession?.codeVerifier) {
                throw new Error('Ogiltig OAuth callback - saknar code eller code_verifier');
            }

            // Byt ut auktoriseringskoden mot en access token
            const tokenResponse = await this.onslipService.exchangeCodeForToken(
                code as string,
                oauthSession.codeVerifier
            );

            // Verifiera att token fungerar
            const isValid = await this.onslipService.verifyToken(tokenResponse.access_token);
            if (!isValid) {
                throw new Error('Erhållen token är ogiltig');
            }

            logger.info('Successfully obtained and verified access token');

            // TODO: Här kan du spara token-informationen i din databas om det behövs
            
            // Rensa session
            delete req.session.oauth;
            await req.session.save();

            // Omdirigera tillbaka till frontend med success
            const redirectUrl = new URL('/config', env.cors.origin);
            redirectUrl.searchParams.set('success', 'true');
            if (oauthSession.state) {
                redirectUrl.searchParams.set('state', oauthSession.state);
            }
            
            res.redirect(redirectUrl.toString());
        } catch (error) {
            logger.error('OAuth callback error:', error);
            
            // Rensa session vid fel
            delete req.session.oauth;
            await req.session.save();
            
            // Omdirigera till frontend med felmeddelande
            const redirectUrl = new URL('/config', env.cors.origin);
            redirectUrl.searchParams.set('error', 'true');
            redirectUrl.searchParams.set(
                'message', 
                error instanceof Error ? error.message : 'Kunde inte slutföra Onslip-integrationen'
            );
            
            res.redirect(redirectUrl.toString());
        }
    };

    /**
     * Registrerar integrationen med Onslip
     */
    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            logger.info('Attempting to register integration');
            const result = await this.onslipService.registerIntegration();
            logger.info('Integration registered successfully');
            res.json(result);
        } catch (error) {
            logger.error('Integration registration error:', error);
            res.status(500).json({ 
                error: 'Kunde inte registrera integration',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };
}

export default new OAuthController();
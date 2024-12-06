import app from './app';
import { env } from './config/environment';
import { logger } from './utils/logger';

const start = async () => {
    try {
        // Validera nödvändiga OAuth-konfigurationer
        const requiredOAuthVars = ['ONSLIP_CLIENT_ID', 'ONSLIP_REDIRECT_URI', 'SESSION_SECRET'];
        const missingVars = requiredOAuthVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            logger.warn(`Saknade OAuth-miljövariabler: ${missingVars.join(', ')}`);
        }

        app.listen(env.port, () => {
            logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
            logger.info(`CORS configured for origins: ${env.cors.origin}`);
        });
    } catch (error) {
        logger.error('Error starting server:', error);
        process.exit(1);
    }
};

start();
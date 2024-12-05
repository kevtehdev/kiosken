import app from './app';
import { env } from './config/enviroment';
import { logger } from './utils/logger';

const start = async () => {
    try {
        app.listen(env.port, () => {
            logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
        });
    } catch (error) {
        logger.error('Error starting server:', error);
        process.exit(1);
    }
};

start();
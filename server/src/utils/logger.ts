import winston from 'winston';
import { env } from '../config/enviroment';

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: env.nodeEnv === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (env.nodeEnv !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
import winston from 'winston';
import { env } from '../config/environment';
import path from 'path';

// Format för utvecklingsmiljö - mer läsbart och koncist
const developmentFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        // Rensa bort onödig metadata och formatera bara relevant information
        const cleanMeta = { ...meta };
        delete cleanMeta.timestamp;
        delete cleanMeta.service;
        
        // Om det finns metadata, visa den på ett snyggt sätt
        const metaStr = Object.keys(cleanMeta).length 
            ? `\n${JSON.stringify(cleanMeta, null, 2)}`
            : '';

        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

// Format för produktionsmiljö - mer detaljerat för felsökning
const productionFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Konfigurera loggkatalog
const LOG_DIR = path.join(process.cwd(), 'logs');

// Skapa logger med olika konfigurationer baserat på miljö
export const logger = winston.createLogger({
    level: env.nodeEnv === 'production' ? 'info' : 'debug',
    format: env.nodeEnv === 'production' ? productionFormat : developmentFormat,
    defaultMeta: { 
        service: 'kiosken-api',
        environment: env.nodeEnv 
    },
    transports: [
        // Konsol-transport med anpassad formattering
        new winston.transports.Console({
            format: developmentFormat
        }),
        
        // Felloggar till fil
        new winston.transports.File({ 
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // HTTP-förfrågningar till fil
        new winston.transports.File({ 
            filename: path.join(LOG_DIR, 'http.log'),
            level: 'http',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.printf(info => {
                    // Rensa bort onödig information från HTTP-loggar
                    const { timestamp, message, method, url, status, duration } = info;
                    return JSON.stringify({
                        timestamp,
                        message,
                        method,
                        url,
                        status,
                        duration
                    });
                })
            )
        })
    ],
    
    // Hantering av oväntade fel
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(LOG_DIR, 'exceptions.log')
        })
    ]
});

// Hjälpfunktioner för konsekvent loggning
export const logHttpRequest = (req: any, duration?: number) => {
    logger.http('Inkommande förfrågan', {
        method: req.method,
        url: req.url,
        duration,
        status: req.res?.statusCode
    });
};

export const logError = (error: Error, context?: any) => {
    logger.error(error.message, {
        stack: error.stack,
        ...context
    });
};
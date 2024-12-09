import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

// Interface för responseTime metrics
interface ResponseTimeMetrics {
    startTime: number;
    endTime: number;
    duration: number;
}

// Utöka Express Request interface för att inkludera metrics
declare global {
    namespace Express {
        interface Request {
            metrics: ResponseTimeMetrics;
        }
    }
}

/**
 * Skapa och lägg till ett unikt request ID
 */
const addRequestId = (req: Request): string => {
    const requestId = req.headers['x-request-id'] as string || randomUUID();
    req.headers['x-request-id'] = requestId;
    return requestId;
};

/**
 * Sanitera känslig information från request/response
 */
const sanitizeData = (data: any): any => {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'credentials'];
    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
        if (field in sanitized) {
            sanitized[field] = '[RADERAD]';
        }
    });

    return sanitized;
};

/**
 * Huvudsaklig logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const requestId = addRequestId(req);
    
    // Initiera metrics med startTime
    req.metrics = {
        startTime: Date.now(),
        endTime: 0,
        duration: 0
    };

    // Logga inkommande förfrågan
    logger.info('Inkommande förfrågan', {
        requestId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        path: req.path,
        headers: sanitizeData(req.headers),
        query: sanitizeData(req.query),
        body: req.method !== 'GET' ? sanitizeData(req.body) : undefined,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Fånga respons
    const originalSend = res.send;
    res.send = function(body): Response {
        res.locals.body = body;
        return originalSend.call(this, body);
    };

    // Hantera respons
    res.on('finish', () => {
        // Uppdatera metrics
        req.metrics.endTime = Date.now();
        req.metrics.duration = req.metrics.endTime - req.metrics.startTime;

        const level = res.statusCode >= 400 ? 'warn' : 'info';
        
        logger.log(level, 'Förfrågan slutförd', {
            requestId,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: req.metrics.duration,
            responseHeaders: sanitizeData(res.getHeaders()),
            responseBody: res.statusCode >= 400 ? sanitizeData(res.locals.body) : undefined,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });

    next();
};
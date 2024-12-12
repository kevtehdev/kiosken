import { Request, Response, NextFunction } from "express";
import { logger } from '../utils/logger';
import { env } from '../config/environment';

// Utökad error interface för bättre felhantering
export interface AppError extends Error {
    status?: number;
    code?: string;
    details?: any;
    operational?: boolean;
}

// Anpassade felkoder för applikationen
export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    INTEGRATION_ERROR = 'INTEGRATION_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    ONSLIP_API_ERROR = 'ONSLIP_API_ERROR',
    PAYMENT_ERROR = 'PAYMENT_ERROR',
    PAYMENT_PROCESSING_ERROR = 'PAYMENT_PROCESSING_ERROR',
    PAYMENT_VALIDATION_ERROR = 'PAYMENT_VALIDATION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Hjälpklass för att skapa strukturerade fel
export class ApplicationError extends Error implements AppError {
    constructor(
        message: string,
        public status: number = 500,
        public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
        public operational: boolean = true,
        public details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Centraliserad felhanterare
export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Skapa strukturerad felinformation
    const errorInfo = {
        message: err.message,
        code: err.code || ErrorCode.INTERNAL_ERROR,
        status: err.status || 500,
        operational: err.operational ?? true,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
        path: req.path,
        method: req.method,
    };

    // Logga felet med relevant information
    logger.error('Fel uppstod vid hantering av förfrågan', {
        error: {
            ...errorInfo,
            stack: err.stack,
            details: err.details
        },
        request: {
            headers: req.headers,
            query: req.query,
            params: req.params,
            body: req.method !== 'GET' ? req.body : undefined,
            ip: req.ip,
            userAgent: req.get('user-agent')
        }
    });

    // Förbered svaret till klienten
    const clientResponse = {
        error: {
            message: errorInfo.message,
            code: errorInfo.code,
            ...(env.nodeEnv === 'development' ? {
                details: err.details,
                stack: err.stack
            } : {})
        },
        status: errorInfo.status,
        timestamp: errorInfo.timestamp,
        requestId: errorInfo.requestId
    };

    // Skicka svar
    res.status(errorInfo.status).json(clientResponse);
};
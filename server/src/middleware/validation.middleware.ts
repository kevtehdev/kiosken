import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApplicationError, ErrorCode } from './error.middleware';
import { env } from '../config/environment';

interface ValidationOptions {
    required?: boolean;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

/**
 * Generisk validering av fält
 */
const validateField = (
    value: any,
    fieldName: string,
    options: ValidationOptions = {}
): void => {
    const {
        required = true,
        minValue,
        maxValue,
        minLength,
        maxLength,
        pattern
    } = options;

    if (required && (value === undefined || value === null)) {
        throw new ApplicationError(
            `Fältet '${fieldName}' är obligatoriskt`,
            400,
            ErrorCode.VALIDATION_ERROR
        );
    }

    if (value !== undefined && value !== null) {
        if (typeof value === 'number') {
            if (minValue !== undefined && value < minValue) {
                throw new ApplicationError(
                    `${fieldName} måste vara större än eller lika med ${minValue}`,
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }
            if (maxValue !== undefined && value > maxValue) {
                throw new ApplicationError(
                    `${fieldName} måste vara mindre än eller lika med ${maxValue}`,
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }
        }

        if (typeof value === 'string') {
            if (minLength !== undefined && value.length < minLength) {
                throw new ApplicationError(
                    `${fieldName} måste vara minst ${minLength} tecken`,
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }
            if (maxLength !== undefined && value.length > maxLength) {
                throw new ApplicationError(
                    `${fieldName} får inte vara längre än ${maxLength} tecken`,
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }
            if (pattern && !pattern.test(value)) {
                throw new ApplicationError(
                    `${fieldName} har ett ogiltigt format`,
                    400,
                    ErrorCode.VALIDATION_ERROR
                );
            }
        }
    }
};

/**
 * Validera betalningsförfrågan
 */
export const validatePaymentRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { amount, orderId } = req.body;

        validateField(amount, 'amount', { minValue: 0.01 });
        validateField(orderId, 'orderId', { minLength: 1, maxLength: 50 });

        logger.debug('Betalningsförfrågan validerad', {
            amount,
            orderId,
            requestId: req.headers['x-request-id']
        });

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Validera session
 */
export const validateSession = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        // Kontrollera session existens
        if (!req.session) {
            throw new ApplicationError(
                'Session är inte konfigurerad',
                500,
                ErrorCode.INTERNAL_ERROR
            );
        }

        // Kontrollera session timeout
        if (req.session.cookie.expires && new Date() > req.session.cookie.expires) {
            throw new ApplicationError(
                'Session har gått ut',
                401,
                ErrorCode.AUTHENTICATION_ERROR
            );
        }

        // Kontrollera CSRF om det inte är en GET-förfrågan
        if (req.method !== 'GET' && !req.headers['x-csrf-token']) {
            throw new ApplicationError(
                'CSRF-token saknas',
                403,
                ErrorCode.AUTHORIZATION_ERROR
            );
        }

        // Kontrollera API nyckel för externa förfrågningar
        if (req.path.startsWith('/api/') && !req.headers['x-api-key']) {
            const apiKey = req.headers['x-api-key'];
            if (apiKey !== env.onslip.apiKey) {
                throw new ApplicationError(
                    'Ogiltig API-nyckel',
                    401,
                    ErrorCode.AUTHENTICATION_ERROR
                );
            }
        }

        logger.debug('Session validerad', {
            sessionId: req.sessionID,
            requestId: req.headers['x-request-id']
        });

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Validera Onslip OAuth-förfrågan
 */
export const validateOAuthRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        if (!req.session.oauth?.codeVerifier) {
            throw new ApplicationError(
                'Ogiltig OAuth-förfrågan',
                400,
                ErrorCode.VALIDATION_ERROR,
                true,
                { message: 'Code verifier saknas' }
            );
        }

        const { code, error } = req.query;

        if (error) {
            throw new ApplicationError(
                'OAuth-fel från Onslip',
                400,
                ErrorCode.ONSLIP_API_ERROR,
                true,
                { error }
            );
        }

        if (!code) {
            throw new ApplicationError(
                'OAuth-kod saknas',
                400,
                ErrorCode.VALIDATION_ERROR
            );
        }

        logger.debug('OAuth-förfrågan validerad', {
            requestId: req.headers['x-request-id']
        });

        next();
    } catch (error) {
        next(error);
    }
};
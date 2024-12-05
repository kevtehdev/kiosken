import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    status?: number;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        error: err.message || 'Något gick fel!',
        status: err.status || 500
    });
};

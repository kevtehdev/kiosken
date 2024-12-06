import { Request, Response, NextFunction } from 'express';

export const validatePaymentRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Ogiltigt belopp' });
    }

    if (!orderId) {
        return res.status(400).json({ error: 'Order-ID saknas' });
    }

    next();
};

export const validateSession = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.session) {
        res.status(500).json({ error: 'Session är inte konfigurerad' });
        return;
    }
    next();
};
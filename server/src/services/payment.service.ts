import { PaymentResult, PaymentStatus } from '../types/payment.types';
import { logger } from '../utils/logger';
import { ApplicationError } from '../middleware/error.middleware';
import { env } from '../config/environment';

class PaymentService {
    private config = {
        terminalId: env.viva.terminalId,
        apiKey: env.viva.apiKey,
        merchantId: env.viva.merchantId,
    };

    async processCardPayment(amount: number, orderId: string): Promise<PaymentResult> {
        try {
            if (!this.validateConfig()) {
                throw new ApplicationError('Terminal configuration missing', 500);
            }

            const response = await fetch(`${process.env.VIVA_API_URL || 'https://api.vivapayments.com'}/terminals/${this.config.terminalId}/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100),
                    orderId,
                    currency: 'SEK',
                    merchantId: this.config.merchantId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                logger.error('Terminal payment initiation failed', { 
                    status: response.status, 
                    error: errorData,
                    orderId
                });
                return {
                    status: 'failed',
                    message: errorData.message || 'Terminal payment initiation failed',
                    error: errorData
                };
            }

            const result = await response.json();
            logger.info('Payment initiated successfully', {
                orderId,
                transactionId: result.transactionId,
                terminalId: this.config.terminalId
            });

            return {
                status: 'processing',
                message: 'Payment initiated on terminal',
                transactionId: result.transactionId
            };

        } catch (error) {
            logger.error('Terminal payment initiation error', { error, orderId });
            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Unexpected payment error',
                error
            };
        }
    }

    async checkPaymentStatus(orderId: string): Promise<PaymentResult> {
        try {
            const response = await fetch(
                `${process.env.VIVA_API_URL || 'https://api.vivapayments.com'}/terminals/${this.config.terminalId}/transactions/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`
                    }
                }
            );

            if (!response.ok) {
                throw new ApplicationError('Failed to check payment status', 400);
            }

            const result = await response.json();
            logger.info('Payment status checked', {
                orderId,
                status: result.status,
                transactionId: result.transactionId
            });

            return this.formatPaymentResponse(result);

        } catch (error) {
            logger.error('Payment status check failed', { error, orderId });
            return {
                status: 'failed',
                message: 'Could not check payment status',
                error
            };
        }
    }

    private validateConfig(): boolean {
        const isValid = Boolean(
            this.config.merchantId &&
            this.config.apiKey &&
            this.config.terminalId
        );

        if (!isValid) {
            logger.error('Invalid Viva payment configuration', {
                hasMerchantId: Boolean(this.config.merchantId),
                hasApiKey: Boolean(this.config.apiKey),
                hasTerminalId: Boolean(this.config.terminalId)
            });
        }

        return isValid;
    }

    private formatPaymentResponse(result: any): PaymentResult {
        switch (result.status.toUpperCase()) {
            case 'COMPLETED':
                return {
                    status: 'completed',
                    message: 'Payment completed successfully',
                    transactionId: result.transactionId,
                    orderCode: result.orderCode
                };
            case 'FAILED':
                return {
                    status: 'failed',
                    message: result.message || 'Payment failed',
                    transactionId: result.transactionId,
                    error: result.error
                };
            case 'PROCESSING':
                return {
                    status: 'processing',
                    message: 'Payment is being processed',
                    transactionId: result.transactionId
                };
            default:
                return {
                    status: 'pending',
                    message: 'Payment status unknown',
                    transactionId: result.transactionId
                };
        }
    }
}

export default new PaymentService();
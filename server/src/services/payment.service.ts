import { PaymentResult, PaymentStatus } from '../types/payment.types';
import { logger } from '../utils/logger';
import { ApplicationError } from '../middleware/error.middleware';
import { env } from '../config/environment';

class PaymentService {
    private config = {
        apiKey: env.viva.apiKey,
        merchantId: env.viva.merchantId,
    };

    private getHeaders(): Record<string, string> {
        return {
            'x-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async processCardPayment(amount: number, orderId: string): Promise<PaymentResult> {
        console.log('=== Starting card payment process ===');
        console.log('Configuration:', {
            merchantId: this.config.merchantId,
            apiKey: 'XXXX' + this.config.apiKey.slice(-4)
        });
        console.log('Payment details:', { amount, orderId });

        try {
            if (!this.validateConfig()) {
                console.error('Invalid payment configuration');
                throw new ApplicationError('Payment configuration missing', 500);
            }

            const amountInCents = Math.round(amount * 100);
            const apiUrl = `${env.viva.apiUrl}/nativecheckout/v2/transactions?merchantId=${encodeURIComponent(this.config.merchantId)}`;

            const payload = {
                amount: amountInCents,
                preauth: false,
                merchantTrns: orderId,
                customerTrns: orderId,
                currencyCode: 752, // SEK
                paymentTimeout: 300,
                sourceCode: "Default",
                allowRecurring: false,
                maxInstallments: 0,
                paymentNotification: true,
                tipAmount: 0,
                disableExactAmount: false,
                disableCash: true,
                disableWallet: false
            };

            const headers = this.getHeaders();

            console.log('API URL:', apiUrl);
            console.log('Request payload:', payload);
            console.log('Request headers:', {
                ...headers,
                'x-api-key': 'XXXX' + this.config.apiKey.slice(-4)
            });

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            console.log('Viva API Response status:', response.status);
            console.log('Response headers:', {
                ...Object.fromEntries(response.headers.entries())
            });

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { message: responseText };
                }

                console.error('Payment initiation failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });

                return {
                    status: 'failed',
                    message: this.getErrorMessage(response.status, errorData),
                    error: errorData
                };
            }

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse successful response:', e);
                return {
                    status: 'failed',
                    message: 'Invalid response from payment provider',
                    error: { raw: responseText }
                };
            }

            console.log('Viva API Response data:', responseData);

            if (!responseData.orderCode) {
                return {
                    status: 'failed',
                    message: 'Missing orderCode in response',
                    error: responseData
                };
            }

            return {
                status: 'processing',
                message: 'Payment initiated',
                transactionId: responseData.orderCode
            };

        } catch (error) {
            console.error('Payment process error:', error);
            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Unexpected payment error',
                error
            };
        }
    }

    async checkPaymentStatus(orderId: string): Promise<PaymentResult> {
        console.log('=== Checking payment status ===');
        console.log('Order ID:', orderId);
        
        try {
            const url = `${env.viva.apiUrl}/nativecheckout/v2/transactions/${orderId}?merchantId=${encodeURIComponent(this.config.merchantId)}`;
            console.log('Request URL:', url);

            const headers = this.getHeaders();

            console.log('Status check headers:', {
                ...headers,
                'x-api-key': 'XXXX' + this.config.apiKey.slice(-4)
            });

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            const responseText = await response.text();
            console.log('Raw status response:', responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { message: responseText };
                }

                console.error('Status check failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });

                return {
                    status: 'failed',
                    message: this.getErrorMessage(response.status, errorData),
                    error: errorData
                };
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse status response:', e);
                return {
                    status: 'failed',
                    message: 'Invalid status response from payment provider',
                    error: { raw: responseText }
                };
            }

            console.log('Status check response data:', result);
            return this.formatPaymentResponse(result);

        } catch (error) {
            console.error('Payment status check error:', error);
            return {
                status: 'failed',
                message: 'Could not check payment status',
                error
            };
        }
    }

    private getErrorMessage(status: number, errorData: any): string {
        switch (status) {
            case 401:
                return 'Authentication failed. Please check API key.';
            case 403:
                return 'Access denied. Please verify API key permissions.';
            case 404:
                return 'Payment resource not found.';
            case 400:
                return errorData.message || 'Invalid payment request.';
            case 500:
                return 'Payment service temporarily unavailable.';
            default:
                return errorData.message || `Payment failed with status ${status}`;
        }
    }

    private validateConfig(): boolean {
        const configStatus = {
            hasMerchantId: Boolean(this.config.merchantId),
            hasApiKey: Boolean(this.config.apiKey)
        };
        
        console.log('Config validation status:', configStatus);
        
        const isValid = Object.values(configStatus).every(Boolean);
        console.log('Config validation result:', isValid);
        
        return isValid;
    }

    private formatPaymentResponse(result: any): PaymentResult {
        console.log('Formatting payment response for status:', result.statusId || result.StatusId);
        
        const response = {
            status: 'pending',
            message: '',
            transactionId: result.orderCode || result.OrderCode
        } as PaymentResult;

        const status = (result.statusId || result.StatusId || '').toUpperCase();

        // Viva status codes
        switch (status) {
            case 'F':
            case 'COMPLETED':
                response.status = 'completed';
                response.message = 'Payment completed successfully';
                break;
            case 'A':
            case 'CANCELED':
            case 'FAILED':
                response.status = 'failed';
                response.message = result.message || 'Payment failed';
                response.error = result.error;
                break;
            case 'D':
            case 'PROCESSING':
                response.status = 'processing';
                response.message = 'Payment is being processed';
                break;
            default:
                response.status = 'pending';
                response.message = 'Payment status unknown';
        }

        console.log('Formatted response:', response);
        return response;
    }
}

export default new PaymentService();
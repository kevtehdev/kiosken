import { PaymentStatus } from '../types';

class PaymentService {
    private config = {
        apiKey: process.env.VIVA_API_KEY || '',
        merchantId: process.env.VIVA_MERCHANT_ID || '',
        terminalId: process.env.VIVA_TERMINAL_ID || ''
    };

    async processPayment(amount: number, orderId: string): Promise<PaymentStatus> {
        try {
            if (!this.config.apiKey || !this.config.merchantId || !this.config.terminalId) {
                throw new Error('Viva API-konfiguration saknas');
            }

            const response = await fetch('https://api.viva.com/payments/v1/terminal-payments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchantId: this.config.merchantId,
                    terminalId: this.config.terminalId,
                    amount: Math.round(amount * 100),
                    currency: 'SEK',
                    orderId: orderId,
                    captureMode: 'AUTO'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return this.formatPaymentResponse(result);
        } catch (error) {
            console.error('Betalningsfel:', error);
            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Ett oväntat fel uppstod vid betalningen'
            };
        }
    }

    private formatPaymentResponse(result: any): PaymentStatus {
        if (result.status === 'COMPLETED') {
            return {
                status: 'completed',
                message: 'Betalningen genomförd',
                transactionId: result.transactionId
            };
        }
        return {
            status: 'failed',
            message: result.message || 'Betalningen misslyckades',
            transactionId: result.transactionId
        };
    }
}

export default PaymentService;  
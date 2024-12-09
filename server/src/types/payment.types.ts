export interface PaymentResult {
    status: PaymentStatus;
    message: string;
    transactionId?: string;
    orderCode?: string;
    error?: any;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type PaymentMethod = 'card' | 'swish';

export interface VivaPaymentConfig {
    apiKey: string;
    merchantId: string;
    terminalId: string;
    apiUrl: string;
}
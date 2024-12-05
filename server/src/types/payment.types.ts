export interface PaymentStatus {
    status: 'pending' | 'completed' | 'failed';
    message: string;
    transactionId?: string;
}

export interface VivaPaymentConfig {
    apiKey: string;
    merchantId: string;
    terminalId: string;
}
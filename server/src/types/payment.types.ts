export type PaymentStatus = 'processing' | 'completed' | 'failed' | 'pending';

export interface PaymentResult {
    status: PaymentStatus;
    message: string;
    transactionId?: string;
    orderCode?: string;
    error?: any;
}

export interface VivaPaymentResponse {
    statusId: string;  // 'F' = completed, 'A' = failed, 'D' = processing
    transactionId: string;
    orderCode: string;
    message?: string;
    error?: any;
}
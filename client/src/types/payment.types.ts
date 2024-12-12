export type PaymentStatus = 'processing' | 'completed' | 'failed' | 'pending';

export interface PaymentResult {
    status: PaymentStatus;
    message: string;
    transactionId?: string;
    orderCode?: string;
    checkoutUrl?: string;  // Lagt till för Smart Checkout
    amount?: number;       // Lagt till för Smart Checkout
    customerEmail?: string;  // Lagt till för Smart Checkout
    paymentMethod?: string;  // Lagt till för Smart Checkout
    error?: any;
}
import { API } from "@onslip/onslip-360-web-api";

export type PaymentStatus = 'processing' | 'completed' | 'failed' | 'pending';

export interface PaymentResult {
    status: PaymentStatus;
    message: string;
    transactionId?: string;
    orderCode?: string;
    checkoutUrl?: string;
    amount?: number;
    customerEmail?: string;
    paymentMethod?: string;
    error?: any;
}

export interface CartItemType extends Omit<API.Item, 'product'> {
    'product-name': string;
    product: number;
    type: 'goods';
}
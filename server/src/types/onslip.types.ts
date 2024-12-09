import { API } from '@onslip/onslip-360-node-api';
import { PaymentMethod, PaymentStatus } from './payment.types';

export interface OnslipConfig {
    apiKey: string;
    environment: 'production' | 'sandbox';
    hawkId: string;
    realm: string;
    baseUrl: string;
}

export type OnslipButton = API.Button;
export type OnslipButtonMap = API.ButtonMap;
export type OnslipProduct = API.Product;
export type OnslipTab = API.Tab;
export type OnslipItem = API.Item;

export interface OnslipOrderCustomFields {
    deliveryLocation?: string;
    paymentMethod?: PaymentMethod;
    customerEmail?: string;
    deliveryNotes?: string;
}

export interface OnslipOrder extends API.Order {
    customFields?: OnslipOrderCustomFields;
}

export interface OnslipPaymentExtended extends API.Payment {
    transactionId: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
}

export interface OnslipCustomerExtended extends API.Customer {
    deliveryAddresses?: {
        address: string;
        notes?: string;
    }[];
    preferredPaymentMethod?: PaymentMethod;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
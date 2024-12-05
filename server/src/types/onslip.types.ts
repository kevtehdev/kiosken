import { API } from '@onslip/onslip-360-node-api';

export interface OnslipConfig {
    apiKey: string;
    environment: 'production' | 'sandbox';
    hawkId: string;
    realm: string;
    baseUrl: string;
}

// Onslip API base types
export type OnslipButton = API.Button;
export type OnslipButtonMap = API.ButtonMap;
export type OnslipProduct = API.Product;
export type OnslipPayment = API.Payment;
export type OnslipCustomer = API.Customer;
export type OnslipTab = API.Tab;
export type OnslipItem = API.Item;
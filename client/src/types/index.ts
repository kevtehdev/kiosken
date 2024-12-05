import { API } from '@onslip/onslip-360-node-api';

export type Product = API.Product;

export interface CartItem {
    product: number;
    'product-name': string;
    quantity: number;
    price?: number;
    type: 'goods';
}
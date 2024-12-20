import { API } from '@onslip/onslip-360-node-api';

export type Product = API.Product;

export interface CartItem {
    product: number;
    'product-name': string;
    quantity: number;
    price?: number;
    type: 'goods';
}

export interface Category {
    products: number[];
    id?: number;
    name: string;
    type: "menu" | "tablet-groups" | "tablet-buttons" | "phone-buttons" | "menu-section";
    buttons: API.ButtonMapItem[];
}

export interface CategorySectionProps {
    category: Category;
    products: number[];
    index: number;
}

export interface Campaign {
    id: number;
    name: string;
    type: string;
    'discount-rate'?: number;
    amount?: number;
    rules: Array<{
        products: number[];
    }>;
}

export interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        totalPrice: number;
    }>;
}

export interface OnslipCredentials {
    hawkId: string;
    key: string;
    realm: string;
    journal: string;
}

export interface StockItem {
    id: number;
    quantity: number;
}
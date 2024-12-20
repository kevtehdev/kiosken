import { API } from "@onslip/onslip-360-web-api";

export interface Category {
    products: number[];
    id?: number;
    name: string;
    type: "menu" | "tablet-groups" | "tablet-buttons" | "phone-buttons" | "menu-section";
    buttons: API.ButtonMapItem[];
}

export interface Product {
    id: number;
    name: string;
    price?: number;
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

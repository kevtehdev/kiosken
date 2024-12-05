import { API } from '@onslip/onslip-360-web-api';

export interface ButtonMapItem {
    name?: string;
    product?: number;
    'button-map'?: number;
}

export interface ButtonMap {
    id?: number;
    name: string;
    type: 'tablet-groups' | 'tablet-buttons' | 'phone-buttons' | 'menu' | 'menu-section';
    buttons: ButtonMapItem[];
}

export interface Product {
    id?: number;
    name: string;
    description?: string;
    'product-group': number;
    price?: number;
    unit?: string;
    brand?: string;
    sku?: string;
    alert?: string;    
}

export type StoredButtonMap = API.Stored_ButtonMap;
export type StoredProduct = API.Stored_Product;

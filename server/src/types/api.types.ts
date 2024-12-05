export namespace API {
    export interface Stored_ButtonMap {
        id?: number;
        name: string;
        type: 'tablet-groups' | 'tablet-buttons' | 'phone-buttons' | 'menu' | 'menu-section';
        buttons: Stored_ButtonMapItem[];
    }

    export interface Stored_ButtonMapItem {
        name?: string;
        product?: number;
        'button-map'?: number;
    }

    export interface Stored_Product {
        id?: number;
        name: string;
        price?: number;
        'product-group': number;
    }

    export interface ApiResponse<T> {
        data: T;
        status: number;
        message: string;
    }

    export interface ErrorResponse {
        error: string;
        status: number;
        details?: unknown;
    }
}

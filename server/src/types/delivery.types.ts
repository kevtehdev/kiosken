export interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: string[];
}

export interface DeliveryStaffInfo {
    id: number;
    name: string;
    email: string;
}

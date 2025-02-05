export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: OrderItem[];
    created: Date;
    deliveryNotes?: string; 

}

export interface DeliveryStaffInfo {
    id: number;
    name: string;
    email: string;
    status: 'available' | 'busy' | 'offline';
}

export interface DeliveryNotification {
    type: 'order_confirmation' | 'payment_receipt';
    recipient: string;
    details: DeliveryDetails;
    transactionId?: string;
}

export interface DeliveryStatus {
    orderId: string;
    status: 'pending' | 'delivering' | 'delivered' | 'cancelled';
    updatedAt: Date;
    staffId?: number;
    notes?: string;
}
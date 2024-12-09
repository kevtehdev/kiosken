import { PaymentMethod } from './payment.types';

export interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: OrderItem[];
    paymentMethod: PaymentMethod;
    deliveryNotes?: string;
    created: Date;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface DeliveryStaffInfo {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: 'available' | 'busy' | 'offline';
}

export interface DeliveryNotification {
    type: 'order_confirmation' | 'payment_receipt' | 'staff_notification';
    recipient: string;
    details: DeliveryDetails;
    transactionId?: string;
}

export interface DeliveryStatus {
    orderId: string;
    status: 'pending' | 'delivering' | 'delivered' | 'cancelled';
    updatedAt: Date;
    deliveryStaffId?: number;
    notes?: string;
}
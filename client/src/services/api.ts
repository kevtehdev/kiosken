import { API } from "@onslip/onslip-360-web-api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface PaymentRequest {
    orderReference: string;
    items: any[];
    deliveryDetails: any;
    customerId: number;
    totalAmount: number;
    order: any;
}

export interface PaymentResult {
    status: 'processing' | 'completed' | 'failed' | 'pending';
    message: string;
    transactionId?: string;
    orderCode?: string;
    checkoutUrl?: string;
    amount?: number;
    customerEmail?: string;
    paymentMethod?: string;
    error?: any;
}

export const api = {
    // Products & Buttons
    getProducts: async () => {
        const response = await fetch(`${API_URL}/buttons/api-data`);
        if (!response.ok) throw new Error("Kunde inte hämta produkter");
        return response.json();
    },

    // Customers
    getCustomers: async () => {
        const response = await fetch(`${API_URL}/customers`);
        if (!response.ok) throw new Error("Kunde inte hämta kunder");
        return response.json();
    },

    // Resources
    getResources: async () => {
        const response = await fetch(`${API_URL}/resources`);
        if (!response.ok) throw new Error("Kunde inte hämta resurser");
        return response.json();
    },

    // Campaigns
    getCampaigns: async () => {
        const response = await fetch(`${API_URL}/campaigns`);
        if (!response.ok) throw new Error("Kunde inte hämta kampanjer");
        return response.json();
    },

    calculateDiscount: async (data: {
        originalPrice: number;
        campaign: any;
    }) => {
        const response = await fetch(
            `${API_URL}/campaigns/calculate-discount`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
        );
        if (!response.ok) throw new Error("Kunde inte beräkna rabatt");
        return response.json();
    },

    // Payment Processing
    processPayment: async (data: PaymentRequest): Promise<PaymentResult> => {
        try {
            console.log('Sending payment request:', data);

            const response = await fetch(`${API_URL}/payments/process`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Betalningen misslyckades");
            }

            const result = await response.json();
            console.log('Payment response:', result);

            if (result.status === 'failed') {
                throw new Error(result.message || "Betalningen misslyckades");
            }

            if (!result.checkoutUrl) {
                throw new Error("Ingen checkout-URL mottagen");
            }

            return result;
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Betalningen misslyckades',
                error: error
            };
        }
    },

    checkPaymentStatus: async (orderId: string): Promise<PaymentResult> => {
        try {
            console.log('Checking payment status for order:', orderId);

            const response = await fetch(`${API_URL}/payments/status/${orderId}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Kunde inte kontrollera betalningsstatus");
            }

            const result = await response.json();
            console.log('Payment status response:', result);
            return result;
        } catch (error) {
            console.error('Payment status check error:', error);
            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Kunde inte kontrollera betalningsstatus',
                error: error
            };
        }
    },

    calcDiscountedTotal: async (data: any): Promise<number> => {
        const response = await fetch(`${API_URL}/orders/calc-total-discount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Beräkningen misslyckades");

        const total = response.json();
        return total;
    },

    // Delivery
    sendDeliveryNotification: async (deliveryDetails: any) => {
        const response = await fetch(`${API_URL}/delivery/notifications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deliveryDetails),
        });
        if (!response.ok)
            throw new Error("Kunde inte skicka leveransnotifieringar");
        return response.json();
    },

    findBestCampaign: async (id: number) => {
        const response = await fetch(`${API_URL}/campaigns/find-best`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error("Beräkningen misslyckades");

        const res = (await response.json()) as API.Campaign;
        return res;
    },

    listStockBalance: async (location: number, query?: string) => {
        const response = await fetch(`${API_URL}/stock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location, query }),
        });
        if (!response.ok) throw new Error("Stock not found");

        const res = (await response.json()) as API.StockBalance[];
        return res;
    },
};

export type ApiClient = typeof api;
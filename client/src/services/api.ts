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
    deliveryDetails: DeliveryDetails;
    customerId: number;
    totalAmount: number;
    order: any;
}

export interface OrderDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    status: PaymentStatus;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        totalPrice: number;
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

export type PaymentStatus = "processing" | "completed" | "failed" | "pending";

export interface PaymentResult {
    status: PaymentStatus;
    message: string;
    transactionId?: string;
    orderCode?: string;
    checkoutUrl?: string;
    amount?: number;
    customerEmail?: string;
    paymentMethod?: string;
    error?: any;
    orderDetails?: OrderDetails;
}

export interface JournalEntry {
    type: 'order';
    text: string;
    reference: string;
}

export const api = {
    getProducts: async () => {
        console.log('=== Fetching Products ===');
        try {
            const response = await fetch(`${API_URL}/buttons/api-data`);
            console.log('Products API response status:', response.status);
            
            if (!response.ok) {
                throw new Error("Kunde inte hämta produkter");
            }
            
            const data = await response.json();
            console.log('Products fetched successfully');
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    getCustomers: async () => {
        console.log('=== Fetching Customers ===');
        try {
            const response = await fetch(`${API_URL}/customers`);
            console.log('Customers API response status:', response.status);
            
            if (!response.ok) {
                throw new Error("Kunde inte hämta kunder");
            }
            
            const data = await response.json();
            console.log('Customers fetched successfully');
            return data;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },

    getResources: async () => {
        console.log('=== Fetching Resources ===');
        try {
            const response = await fetch(`${API_URL}/resources`);
            console.log('Resources API response status:', response.status);
            
            if (!response.ok) {
                throw new Error("Kunde inte hämta resurser");
            }
            
            const data = await response.json();
            console.log('Resources fetched successfully');
            return data;
        } catch (error) {
            console.error('Error fetching resources:', error);
            throw error;
        }
    },

    getCampaigns: async () => {
        console.log('=== Fetching Campaigns ===');
        try {
            const response = await fetch(`${API_URL}/campaigns`);
            console.log('Campaigns API response status:', response.status);
            
            if (!response.ok) {
                throw new Error("Kunde inte hämta kampanjer");
            }
            
            const data = await response.json();
            console.log('Campaigns fetched successfully');
            return data;
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            throw error;
        }
    },

    calculateDiscount: async (data: {
        originalPrice: number;
        campaign: any;
    }) => {
        console.log('=== Calculating Discount ===');
        console.log('Discount calculation data:', data);
        
        try {
            const response = await fetch(
                `${API_URL}/campaigns/calculate-discount`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );
            console.log('Discount calculation response status:', response.status);

            if (!response.ok) {
                throw new Error("Kunde inte beräkna rabatt");
            }

            const result = await response.json();
            console.log('Discount calculated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error calculating discount:', error);
            throw error;
        }
    },

    processPayment: async (data: PaymentRequest): Promise<PaymentResult> => {
        console.log('=== Processing Payment ===');
        console.log('Payment request data:', {
            ...data,
            order: '...order data...' // Don't log full order for security
        });

        try {
            const response = await fetch(`${API_URL}/payments/process`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
                credentials: "include",
            });
            console.log('Payment processing response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Betalningen misslyckades");
            }

            const result = await response.json();
            console.log('Payment processed successfully:', {
                status: result.status,
                transactionId: result.transactionId
            });

            if (result.status === "failed") {
                throw new Error(result.message || "Betalningen misslyckades");
            }

            return result;
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                status: "failed",
                message: error instanceof Error ? error.message : "Betalningen misslyckades",
                error: error,
            };
        }
    },

    checkPaymentStatus: async (orderId: string): Promise<PaymentResult> => {
        console.log('=== Checking Payment Status ===');
        console.log('Order ID:', orderId);

        try {
            const response = await fetch(
                `${API_URL}/payments/status/${orderId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );
            console.log('Payment status response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Kunde inte kontrollera betalningsstatus");
            }

            const result = await response.json();
            console.log('Payment status checked successfully:', {
                status: result.status,
                transactionId: result.transactionId
            });
            return result;
        } catch (error) {
            console.error('Payment status check error:', error);
            return {
                status: "failed",
                message: error instanceof Error ? error.message : "Kunde inte kontrollera betalningsstatus",
                error: error,
            };
        }
    },

    calcDiscountedTotal: async (data: any): Promise<number> => {
        console.log('=== Calculating Discounted Total ===');
        console.log('Discount calculation data:', data);

        try {
            const response = await fetch(`${API_URL}/orders/calc-total-discount`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            console.log('Discount calculation response status:', response.status);

            if (!response.ok) {
                throw new Error("Beräkningen misslyckades");
            }

            const total = await response.json();
            console.log('Discounted total calculated:', total);
            return total;
        } catch (error) {
            console.error('Error calculating discounted total:', error);
            throw error;
        }
    },

    sendDeliveryNotification: async (deliveryDetails: DeliveryDetails) => {
        console.log('=== Sending Delivery Notification ===');
        console.log('Delivery details:', deliveryDetails);

        try {
            const response = await fetch(`${API_URL}/delivery/notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deliveryDetails),
            });
            console.log('Delivery notification response status:', response.status);

            if (!response.ok) {
                throw new Error("Kunde inte skicka leveransnotifieringar");
            }

            const result = await response.json();
            console.log('Delivery notification sent successfully');
            return result;
        } catch (error) {
            console.error('Error sending delivery notification:', error);
            throw error;
        }
    },

    findBestCampaign: async (id: number) => {
        console.log('=== Finding Best Campaign ===');
        console.log('Product ID:', id);

        try {
            const response = await fetch(`${API_URL}/campaigns/find-best`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            console.log('Best campaign search response status:', response.status);

            if (!response.ok) {
                throw new Error("Beräkningen misslyckades");
            }

            const res = (await response.json()) as API.Campaign;
            console.log('Best campaign found:', res);
            return res;
        } catch (error) {
            console.error('Error finding best campaign:', error);
            throw error;
        }
    },

    listStockBalance: async (location: number, query?: string) => {
        console.log('=== Listing Stock Balance ===');
        console.log('Location:', location, 'Query:', query);

        try {
            const response = await fetch(`${API_URL}/stock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location, query }),
            });
            console.log('Stock balance response status:', response.status);

            if (!response.ok) {
                throw new Error("Stock not found");
            }

            const res = (await response.json()) as API.StockBalance[];
            console.log('Stock balance retrieved successfully');
            return res;
        } catch (error) {
            console.error('Error listing stock balance:', error);
            throw error;
        }
    },

    getOrderDetails: async (orderId: string): Promise<OrderDetails> => {
        console.log('=== Getting Order Details ===');
        console.log('Order ID:', orderId);

        try {
            const response = await fetch(`${API_URL}/payments/status/${orderId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });
            console.log('Order details response status:', response.status);

            const responseText = await response.text();
            console.log('Order details raw response:', responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: responseText };
                }
                throw new Error(errorData.message || "Kunde inte hämta orderdetaljer");
            }

            const orderDetails = JSON.parse(responseText);
            console.log('Order details retrieved successfully:', orderDetails);
            return orderDetails;
        } catch (error) {
            console.error('Error getting order details:', error);
            throw error;
        }
    },

    createJournalEntry: async (orderId: string, deliveryDetails: DeliveryDetails): Promise<void> => {
        console.log('=== Creating Journal Entry ===');
        console.log('Order ID:', orderId);
        console.log('Delivery Details:', deliveryDetails);

        try {
            const journalData = {
                orderId,
                deliveryDetails,
                timestamp: new Date().toISOString(),
            };
            
            console.log('Sending journal data to backend:', journalData);

            const response = await fetch(`${API_URL}/orders/journal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(journalData),
                credentials: "include",
            });

            console.log('Journal API Response Status:', response.status);
            const responseData = await response.text();
            console.log('Journal API Response:', responseData);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseData);
                } catch {
                    errorData = { message: responseData };
                }
                throw new Error(errorData.message || "Kunde inte skapa journalanteckning");
            }

            console.log('Journal entry created successfully');
        } catch (error) {
            console.error('=== Journal Entry Error ===');
            console.error('Error details:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    }
};

export type ApiClient = typeof api;
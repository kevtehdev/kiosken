const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
}

export const api = {
  // Products & Buttons
  getProducts: async () => {
    const response = await fetch(`${API_URL}/buttons/api-data`);
    if (!response.ok) throw new Error('Kunde inte hämta produkter');
    return response.json();
  },

  // Customers
  getCustomers: async () => {
    const response = await fetch(`${API_URL}/users/customers`);
    if (!response.ok) throw new Error('Kunde inte hämta kunder');
    return response.json();
  },

  // Resources
  getResources: async () => {
    const response = await fetch(`${API_URL}/resources`);
    if (!response.ok) throw new Error('Kunde inte hämta resurser');
    return response.json();
  },

  // Campaigns
  getCampaigns: async () => {
    const response = await fetch(`${API_URL}/campaigns`);
    if (!response.ok) throw new Error('Kunde inte hämta kampanjer');
    return response.json();
  },

  calculateDiscount: async (data: { originalPrice: number; campaign: any }) => {
    const response = await fetch(`${API_URL}/campaigns/calculate-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Kunde inte beräkna rabatt');
    return response.json();
  },

  // Orders & Payments
  processPayment: async (data: PaymentRequest) => {
    const response = await fetch(`${API_URL}/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Betalningen misslyckades');
    return response.json();
  },

  // Delivery
  sendDeliveryNotification: async (deliveryDetails: any) => {
    const response = await fetch(`${API_URL}/delivery/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliveryDetails)
    });
    if (!response.ok) throw new Error('Kunde inte skicka leveransnotifieringar');
    return response.json();
  }
};

export type ApiClient = typeof api;

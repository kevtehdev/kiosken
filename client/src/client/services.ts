export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  export const api = {
    // Buttons & Products
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
  
    // Cart & Payment
    processPayment: async (paymentData: any) => {
      const response = await fetch(`${API_URL}/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (!response.ok) throw new Error('Betalningen misslyckades');
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
  
    // Resources
    getResources: async () => {
      const response = await fetch(`${API_URL}/resources`);
      if (!response.ok) throw new Error('Kunde inte hämta resurser');
      return response.json();
    }
  };
  
  export type ApiClient = typeof api;
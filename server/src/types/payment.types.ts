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
    statusId?: any;
}

export interface VivaPaymentResponse {
    statusId: string; // 'F' = completed, 'A' = failed, 'D' = processing
    transactionId: string;
    orderCode: string;
    state?: string;
    checkoutUrl?: string;
    amount?: number;
    customer?: {
        email: string;
        fullName: string;
        phone: string;
        countryCode: string;
    };
    paymentMethod?: string;
    message?: string;
    error?: any;
}

export interface SmartCheckoutOrder {
    amount: number;
    customerTrns: string;
    customer: {
        email: string;
        fullName: string;
        phone: string;
        countryCode: string;
        requestLang: string;
    };
    paymentTimeout: number;
    preauth: boolean;
    allowRecurring: boolean;
    maxInstallments: number;
    paymentNotification: boolean;
    merchantTrns: string;
    tags: string[];
    sourceCode: string;
    merchantCategories: string[];
    disableExactAmount: boolean;
    disableCash: boolean;
    disableWallet: boolean;
    tipAmount: number;
    currencyCode: number;
    cancelUrl: string;
    successUrl: string;
}

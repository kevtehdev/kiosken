type TransactionStatusId =
    | "F" // Finished
    | "A" // Active
    | "C" // Captured
    | "E" // Error
    | "M" // Claimed
    | "R" // Refunded
    | "X" // Cancelled
    | "MA" // Claim Awaiting Response
    | "MI" // Claim In Progress
    | "ML" // Claim Lost
    | "MS" // Suspected Claimed
    | "MW"; // Claim Won

type CardTypeId =
    | 0 // Visa
    | 1 // Mastercard
    | 2 // Diners
    | 3 // Amex
    | 4 // Invalid
    | 5 // Unknown
    | 6 // Maestro
    | 7 // Discover
    | 8; // JCB

type DigitalWalletId =
    | 2 // Apple Pay
    | 3 // Google Pay
    | 4 // Samsung Pay
    | 6; // MobilePay Online

interface LoyaltyTransaction {
    // Define the structure of LoyaltyTransactions2 if needed
    [key: string]: any; // Placeholder
}

export interface Transaction {
    email: string | null; // The customer's e-mail address
    bankId: string; // The ID of the card scheme
    amount: number; // The amount in the merchant's original currency
    switching: boolean; // Whether or not this is a switching transaction
    orderCode: number; // The order's unique code
    SourceCode: string; // The code of the source related to the transaction
    statusId: TransactionStatusId; // Enum describing the transaction's status
    fullName: string; // The customer's full name
    insDate: string; // The transaction's date & time (ISO string)
    cardNumber: string; // The customer's card number
    currencyCode: string; // Numeric code of the currency (ISO 4712)
    customerTrns: string; // Friendly description for the customer
    merchantTrns: string; // Merchant's short description
    transactionTypeId: number; // The transaction type
    recurringSupport: boolean; // Whether the transaction supports recurring payments
    totalInstallments: number; // Total installments for the transaction
    cardCountryCode: string; // Card's origin country (ISO 3166-1 alpha-2)
    cardIssuingBank: string; // The bank of the card
    currentInstallment: number; // Current number of the installment
    originalAmount: number; // Final amount in the selected currency
    conversionRate: number; // Conversion rate for the original amount
    cardUniqueReference: string | null; // Unique reference for the card used
    OriginalCurrencyCode: string; // Selected currency code (ISO 4712)
    EventId: number | null; // Event ID for unsuccessful calls
    cardTypeId: CardTypeId; // Card type ID
    digitalWalletId: DigitalWalletId | null; // Digital wallet ID or null
    loyaltyTransactions: LoyaltyTransaction[]; // List of loyalty transactions
}

export type PaymentOrder = {
    amount: number; // Required: Amount in the smallest unit of currency (e.g., cents).
    customerTrns?: string; // Optional: Short description for the customer (1-2048 characters).
    customer?: { [key: string]: any }; // Optional: Customer information (flexible schema based on needs).
    dynamicDescriptor?: string; // Optional: Descriptor for the transaction (up to 13 characters).
    paymentTimeout?: number; // Optional: Time in seconds before the payment order expires (default: 1800).
    currencyCode?: string; // Optional: Currency code (default: merchant's currency).
    preauth?: boolean; // Optional: If true, creates a pre-authorization.
    allowRecurring?: boolean; // Optional: Enables recurring payments.
    maxInstallments?: number; // Optional: Maximum installments the customer can choose (1-36).
    forceMaxInstallments?: boolean; // Optional: Forces customer to use the specified maxInstallments.
    paymentNotification?: boolean; // Optional: If true, sends an email payment request to the customer.
    tipAmount?: number; // Optional: Tip amount included in the payment order.
    disableExactAmount?: boolean; // Optional: Allows customer to specify the payment amount.
    disableCash?: boolean; // Optional: Disables the Cash (Viva Spot) option for payment.
    disableWallet?: boolean; // Optional: Disables Viva Wallet payment option.
    sourceCode?: string; // Optional: Specifies the payment source code.
    merchantTrns?: string; // Optional: Unique ID or description for merchant reference.
    tags?: string[]; // Optional: Tags for grouping and filtering transactions.
    cardTokens?: string[]; // Optional: Array of saved card tokens for the customer.
    paymentMethodFees?: Array<{
        paymentMethodId: string;
        fee: number;
    }>; // Optional: Additional fees for specific payment methods.
    isCardVerification?: boolean; // Optional: Triggers card verification if set to true.
    nbgLoanOrderOptions?: { [key: string]: any }; // Optional: Details for NBG Loan orders.
    klarnaOrderOptions?: Array<{ [key: string]: any }>; // Optional: Details for Klarna payment method.
};

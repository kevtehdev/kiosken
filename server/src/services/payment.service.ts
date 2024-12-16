import { PaymentResult, PaymentStatus } from "../types/payment.types";
import { logger } from "../utils/logger";
import { ApplicationError } from "../middleware/error.middleware";
import { env } from "../config/environment";

class PaymentService {
    private config = {
        apiKey: env.viva.apiKey,
        merchantId: env.viva.merchantId,
        baseUrl: env.viva.apiUrl,
    };

    private bearer: { token: string; expiresAt: Date } | undefined = undefined;

    private getHeaders(): Record<string, string> {
        if (this.isBearerValid()) {
            return {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${this.bearer!.token}`,
            };
        }
        return {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
                `${this.config.merchantId}:${this.config.apiKey}`
            ).toString("base64")}`,
        };
    }

    isBearerValid(): boolean {
        return this.bearer !== undefined && new Date() < this.bearer.expiresAt;
    }

    async setBearerToken() {
        console.log("Setting bearer token");

        const response = await fetch(
            "https://demo-accounts.vivapayments.com/connect/token",
            {
                method: "POST",
                headers: this.getHeaders(),
                body: new URLSearchParams({
                    grant_type: "client_credentials",
                }).toString(),
            }
        );

        if (!response.ok) {
            console.log("Response, not OK", response);
            console.log("ResBody", await response.text());
            throw new Error("Failed getting access token");
        }

        const body = await response.json();

        this.bearer = {
            token: body.access_token,
            expiresAt: new Date(Date.now() + (body.expires_in - 60) * 1000),
        };
    }

    async createSmartCheckoutOrder(
        amount: number,
        orderId: string
    ): Promise<PaymentResult> {
        console.log("=== Creating Smart Checkout Order ===");
        console.log("Order details:", { amount, orderId });

        if (!this.isBearerValid()) {
            await this.setBearerToken();
        }

        try {
            if (!this.validateConfig()) {
                throw new ApplicationError(
                    "Payment configuration missing",
                    500
                );
            }

            const amountInCents = Math.round(amount * 100);
            // Använd smart checkout endpoint
            const apiUrl = `${this.config.baseUrl}/checkout/v2/orders`;

            const payload = {
                amount: amountInCents,
                merchantTrns: orderId,
                customerTrns: orderId,
                sourceCode: "7854",
                paymentTimeout: 1800,
                preauth: false,
                allowRecurring: false,
                maxInstallments: 0,
                currencyCode: 752, // SEK
                customer: {
                    email: "",
                    fullName: "",
                    phone: "",
                    countryCode: "SE",
                    requestLang: "sv-SE",
                },
                paymentNotification: true,
                disableExactAmount: false,
                disableCash: true,
                disableWallet: false,
                tipAmount: 0,
                cancelUrl: `${
                    env.cors.origin.split(",")[0]
                }/cart?status=canceled`,
                successUrl: `${
                    env.cors.origin.split(",")[0]
                }/cart?status=success`,
            };

            console.log("Creating order with payload:", payload);
            console.log("Using headers:", {
                ...this.getHeaders(),
                Authorization: "Bearer ****", // Dölj credentials i loggen
            });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            console.log("res", response);

            const responseText = await response.text();
            console.log("Raw response:", responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { message: responseText };
                }

                console.error("Order creation failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData,
                    headers: response.headers,
                });

                return {
                    status: "failed",
                    message: this.getErrorMessage(response.status, errorData),
                    error: errorData,
                };
            }

            const responseData = JSON.parse(responseText);
            console.log("Order created successfully:", responseData);

            return {
                status: "processing",
                message: "Payment order created",
                transactionId: responseData.orderCode,
                checkoutUrl:
                    responseData.redirectToAcsUrl || responseData.checkoutUrl,
            };
        } catch (error) {
            console.error("Order creation error:", error);
            return {
                status: "failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unexpected error during order creation",
                error,
            };
        }
    }

    async getOrderDetails(orderId: string): Promise<PaymentResult> {
        if (!this.isBearerValid()) {
            await this.setBearerToken();
        }
        console.log("=== Getting order details ===");
        console.log("Order ID:", orderId);

        try {
            const url = `https://demo-api.vivapayments.com/checkout/v2/transactions/${orderId}`;

            const response = await fetch(url, {
                method: "GET",
                headers: this.getHeaders(),
            });

            console.log("RAW RESPONSE", response);

            const responseText = await response.text();
            console.log("Raw order details response:", responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { message: responseText };
                }

                return {
                    status: "failed",
                    message: this.getErrorMessage(response.status, errorData),
                    error: errorData,
                };
            }

            const orderData = JSON.parse(responseText);
            return this.formatOrderResponse(orderData);
        } catch (error) {
            console.error("Error getting order details:", error);
            return {
                status: "failed",
                message: "Could not get order details",
                error,
            };
        }
    }

    private validateConfig(): boolean {
        const configStatus = {
            hasMerchantId: Boolean(this.config.merchantId),
            hasApiKey: Boolean(this.config.apiKey),
            hasBaseUrl: Boolean(this.config.baseUrl),
        };

        console.log("Config validation status:", configStatus);

        return Object.values(configStatus).every(Boolean);
    }

    private getErrorMessage(status: number, errorData: any): string {
        switch (status) {
            case 401:
                return "Authentication failed. Please check API credentials.";
            case 403:
                return "Access denied. Please verify API permissions.";
            case 404:
                return "Order not found.";
            case 400:
                return errorData.message || "Invalid request.";
            case 500:
                return "Payment service temporarily unavailable.";
            default:
                return (
                    errorData.message || `Request failed with status ${status}`
                );
        }
    }

    private formatOrderResponse(orderData: any): PaymentResult {
        const stateMap: Record<string, PaymentStatus> = {
            PENDING: "pending",
            EXPIRED: "failed",
            CANCELED: "failed",
            PAID: "completed",
            FAILED: "failed",
        };

        return {
            status: stateMap[orderData.state] || "pending",
            message: this.getStateMessage(orderData.state),
            transactionId: orderData.orderCode,
            checkoutUrl: orderData.redirectToAcsUrl || orderData.checkoutUrl,
            amount: orderData.amount / 100,
            customerEmail: orderData.customer?.email,
            paymentMethod: orderData.paymentMethod,
            statusId: orderData["statusId"],
        };
    }

    private getStateMessage(state: string): string {
        switch (state) {
            case "PENDING":
                return "Waiting for payment";
            case "EXPIRED":
                return "Payment session expired";
            case "CANCELED":
                return "Payment was canceled";
            case "PAID":
                return "Payment completed successfully";
            case "FAILED":
                return "Payment failed";
            default:
                return "Unknown payment state";
        }
    }
}

export default new PaymentService();

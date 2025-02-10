import dotenv from "dotenv";
import path from "path";

dotenv.config();

interface Environment {
    nodeEnv: string;
    port: number;
    onslip: {
        apiKey: string;
        hawkId: string;
        realm: string;
        environment: "production" | "sandbox";
        apiUrl: string;
        clientId: string;
        redirectUri: string;
        authEndpoint: string;
        tokenEndpoint: string;
        journal: number;
    };
    viva: {
        apiKey: string;
        merchantId: string;
        apiUrl: string;
        apiUrlAccount: string;
        sourceCode: string;
    };
    cors: {
        origin: string;
    };
}

export const env: Environment = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    onslip: {
        apiKey: process.env.ONSLIP_KEY || "",
        hawkId: process.env.ONSLIP_HAWK_ID || "",
        realm: process.env.ONSLIP_REALM || "",
        environment:
            (process.env.ONSLIP_ENVIRONMENT as "production" | "sandbox") ||
            "sandbox",
        apiUrl: process.env.ONSLIP_API_URL || "https://test.onslip360.com/v1/",
        clientId: process.env.ONSLIP_CLIENT_ID || "",
        redirectUri:
            process.env.ONSLIP_REDIRECT_URI ||
            "http://localhost:3000/api/oauth/callback",
        authEndpoint:
            process.env.ONSLIP_AUTH_ENDPOINT ||
            "https://test.onslip360.com/oauth-authorization",
        tokenEndpoint:
            process.env.ONSLIP_TOKEN_ENDPOINT ||
            "https://test.onslip360.com/v1/oauth-token.json",
        journal: Number(process.env.ONSLIP_JOURNAL),
    },
    viva: {
        merchantId: process.env.VIVA_MERCHANT_ID || "",
        apiKey: process.env.VIVA_API_KEY || "",
        apiUrl: process.env.VIVA_API_URL || "https://demo-api.vivapayments.com",
        apiUrlAccount:
            process.env.VIVA_API_URL_ACCOUNT ||
            "https://demo-account.vivapayments.com",
        sourceCode: process.env.VIVA_SOURCE_CODE || "Default",
    },
    cors: {
        origin:
            process.env.CORS_ORIGIN ||
            "http://localhost:5173,http://www.localhost:5173",
    },
};

// Validate required environment variables
const requiredEnvVars = [
    "ONSLIP_HAWK_ID",
    "ONSLIP_KEY",
    "ONSLIP_REALM",
    "ONSLIP_CLIENT_ID",
    "ONSLIP_REDIRECT_URI",
    "VIVA_MERCHANT_ID",
    "VIVA_API_KEY",
];

requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.warn(`Warning: ${varName} is not set in environment variables`);
    }
});

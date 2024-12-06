import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface Environment {
    nodeEnv: string;
    port: number;
    onslip: {
        apiKey: string;
        hawkId: string;
        realm: string;
        environment: 'production' | 'sandbox';
        apiUrl: string;
        // OAuth specific configuration
        clientId: string;
        redirectUri: string;
        authEndpoint: string;
        tokenEndpoint: string;
    };
    viva: {
        apiKey: string;
        merchantId: string;
        terminalId: string;
    };
    cors: {
        origin: string;
    };
}

export const env: Environment = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    onslip: {
        // Existing Onslip configuration
        apiKey: process.env.ONSLIP_KEY || '',
        hawkId: process.env.ONSLIP_HAWK_ID || '',
        realm: process.env.ONSLIP_REALM || '',
        environment: (process.env.ONSLIP_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
        apiUrl: process.env.ONSLIP_API_URL || 'https://test.onslip360.com/v1/',
        
        // OAuth specific configuration
        clientId: process.env.ONSLIP_CLIENT_ID || '',
        redirectUri: process.env.ONSLIP_REDIRECT_URI || 'http://localhost:3000/api/oauth/callback',
        authEndpoint: process.env.NODE_ENV === 'production'
            ? 'https://www.onslip360.com/oauth-authorization'
            : 'https://test.onslip360.com/oauth-authorization',
        tokenEndpoint: process.env.NODE_ENV === 'production'
            ? 'https://api.onslip360.com/v1/oauth-token.json'
            : 'https://test.onslip360.com/v1/oauth-token.json',
    },
    viva: {
        apiKey: process.env.VIVA_API_KEY || '',
        merchantId: process.env.VIVA_MERCHANT_ID || '',
        terminalId: process.env.VIVA_TERMINAL_ID || '',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    }
};

// Validera att nödvändiga variabler finns
const requiredEnvVars = [
    'ONSLIP_HAWK_ID',
    'ONSLIP_KEY',
    'ONSLIP_REALM',
    'ONSLIP_CLIENT_ID',  // Added OAuth requirement
    'ONSLIP_REDIRECT_URI' // Added OAuth requirement
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.warn(`Warning: ${varName} is not set in environment variables`);
    }
});
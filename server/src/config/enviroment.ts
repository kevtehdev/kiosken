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
        apiKey: process.env.ONSLIP_KEY || '',
        hawkId: process.env.ONSLIP_HAWK_ID || '',
        realm: process.env.ONSLIP_REALM || '',
        environment: (process.env.ONSLIP_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
        apiUrl: process.env.ONSLIP_API_URL || 'https://test.onslip360.com/v1/',
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
    'ONSLIP_REALM'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.warn(`Warning: ${varName} is not set in environment variables`);
    }
});
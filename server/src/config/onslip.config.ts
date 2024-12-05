import dotenv from 'dotenv';
import { OnslipConfig } from '../types';

dotenv.config();

export const onslipConfig: OnslipConfig = {
  apiKey: process.env.ONSLIP_API_KEY || '',
  environment: (process.env.ONSLIP_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
  hawkId: process.env.VITE_HAWK_ID || '',
  realm: process.env.VITE_REALM || '',
  baseUrl: process.env.ONSLIP_ENVIRONMENT === 'production' 
    ? 'https://api.onslip.com/v1'
    : 'https://test.onslip360.com/v1/'
};

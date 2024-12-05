import { API } from '@onslip/onslip-360-web-api';

export type CampaignType = API.Campaign.Type;

export interface CampaignRule {
    quantity: number;
    products: number[];
    labels: string[];
}

export interface Campaign {
    id: number;
    name: string;
    type: CampaignType;
    rules: CampaignRule[];
    'discount-rate'?: number;
    amount?: number;
}

export interface ProductCampaign {
    id: number;
    name: string;
    type: CampaignType;
    discountRate?: number;
    amount?: number;
    quantity?: number;
}
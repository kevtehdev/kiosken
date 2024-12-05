import { ButtonMap, Product, Campaign } from '../types';

export const validateButtonMap = (buttonMap: Partial<ButtonMap>): boolean => {
    return !!(
        buttonMap.name &&
        buttonMap.type &&
        Array.isArray(buttonMap.buttons)
    );
};

export const validateProduct = (product: Partial<Product>): boolean => {
    return !!(
        product.name &&
        typeof product['product-group'] === 'number'
    );
};

export const validateCampaign = (campaign: Partial<Campaign>): boolean => {
    return !!(
        campaign.id &&
        campaign.name &&
        campaign.type &&
        Array.isArray(campaign.rules)
    );
};
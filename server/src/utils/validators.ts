import { ButtonMap, ButtonMapItem, Product, Campaign, CampaignRule } from '../types';
import { logger } from './logger';

/**
 * Validera data och logga validation failures
 */
const validateAndLog = <T>(
    data: Partial<T>,
    validationFn: (data: Partial<T>) => boolean,
    entityType: string
): boolean => {
    const isValid = validationFn(data);
    if (!isValid) {
        logger.warn(`Ogiltig ${entityType} data`, {
            entityType,
            data,
            validation: 'failed'
        });
    }
    return isValid;
};

/**
 * Validera ButtonMap med stöd för alla knappkartstyper
 */
export const validateButtonMap = (buttonMap: Partial<ButtonMap>): boolean => {
    return validateAndLog(
        buttonMap,
        (data) => {
            // Validera grundläggande ButtonMap egenskaper
            if (!data.name || typeof data.name !== 'string') return false;
            if (!data.type || !isValidButtonMapType(data.type)) return false;
            if (!Array.isArray(data.buttons)) return false;
            if (data.buttons.length === 0) return false;
            
            // Validera varje knapp i kartan
            return data.buttons.every(button => validateButtonMapItem(button));
        },
        'ButtonMap'
    );
};

/**
 * Validera enskild ButtonMapItem
 */
const validateButtonMapItem = (button: Partial<ButtonMapItem>): boolean => {
    // Minst en av name eller product måste finnas
    if (!button.name && !button.product) return false;
    
    // Om egenskaperna finns, validera deras typer
    if (button.name && typeof button.name !== 'string') return false;
    if (button.product && typeof button.product !== 'number') return false;
    if (button['button-map'] && typeof button['button-map'] !== 'number') return false;

    return true;
};

/**
 * Validera ButtonMap type
 */
const isValidButtonMapType = (type: string): boolean => {
    const validTypes = ['tablet-groups', 'tablet-buttons', 'phone-buttons', 'menu', 'menu-section'];
    return validTypes.includes(type);
};

/**
 * Validera Product med alla möjliga fält
 */
export const validateProduct = (product: Partial<Product>): boolean => {
    return validateAndLog(
        product,
        (data) => {
            // Obligatoriska fält
            if (!data.name || typeof data.name !== 'string') return false;
            if (typeof data['product-group'] !== 'number') return false;

            // Valfria fält - validera endast om de finns
            if (data.id !== undefined && typeof data.id !== 'number') return false;
            if (data.description !== undefined && typeof data.description !== 'string') return false;
            if (data.price !== undefined && typeof data.price !== 'number') return false;
            if (data.unit !== undefined && typeof data.unit !== 'string') return false;
            if (data.brand !== undefined && typeof data.brand !== 'string') return false;
            if (data.sku !== undefined && typeof data.sku !== 'string') return false;
            if (data.alert !== undefined && typeof data.alert !== 'string') return false;
            
            return true;
        },
        'Product'
    );
};

/**
 * Validera Campaign med korrekt regelstruktur
 */
export const validateCampaign = (campaign: Partial<Campaign>): boolean => {
    return validateAndLog(
        campaign,
        (data) => {
            // Validera grundläggande Campaign egenskaper
            if (!data.id || typeof data.id !== 'number') return false;
            if (!data.name || typeof data.name !== 'string') return false;
            if (!data.type || !isValidCampaignType(data.type)) return false;
            if (!Array.isArray(data.rules)) return false;
            if (data.rules.length === 0) return false;

            // Validera valfria fält
            if (data['discount-rate'] !== undefined && typeof data['discount-rate'] !== 'number') return false;
            if (data.amount !== undefined && typeof data.amount !== 'number') return false;

            // Validera varje regel i kampanjen
            return data.rules.every(rule => validateCampaignRule(rule));
        },
        'Campaign'
    );
};

/**
 * Validera enskild CampaignRule
 */
const validateCampaignRule = (rule: Partial<CampaignRule>): boolean => {
    if (typeof rule.quantity !== 'number') return false;
    if (!Array.isArray(rule.products)) return false;
    if (!Array.isArray(rule.labels)) return false;
    
    // Validera att alla produkter är nummer
    if (!rule.products.every(id => typeof id === 'number')) return false;
    // Validera att alla labels är strängar
    if (!rule.labels.every(label => typeof label === 'string')) return false;

    return true;
};

/**
 * Validera Campaign type mot API-typer
 */
const isValidCampaignType = (type: string): boolean => {
    const validTypes = ['product', 'category', 'total'];
    return validTypes.includes(type);
};
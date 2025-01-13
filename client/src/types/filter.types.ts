// Definierar möjliga värden för sortering
export type SortOrder = 'none' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

// Interface för alla filterinställningar
export interface FilterSettings {
    sortOrder: SortOrder;
    hideOutOfStock: boolean;
    onlyShowDiscounts: boolean;
}

// Type guard för att validera SortOrder
export function isSortOrder(value: string): value is SortOrder {
    return ['none', 'price-asc', 'price-desc', 'name-asc', 'name-desc'].includes(value);
}

// Standardvärden för filter
export const DEFAULT_FILTERS: FilterSettings = {
    sortOrder: 'none',
    hideOutOfStock: true,
    onlyShowDiscounts: false
};
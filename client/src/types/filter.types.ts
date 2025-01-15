export type SortOrder = 'none' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export interface FilterSettings {
    sortOrder: SortOrder;
    hideOutOfStock: boolean;
    onlyShowDiscounts: boolean;
}

export function isSortOrder(value: string): value is SortOrder {
    return ['none', 'price-asc', 'price-desc', 'name-asc', 'name-desc'].includes(value);
}

export const DEFAULT_FILTERS: FilterSettings = {
    sortOrder: 'none',
    hideOutOfStock: true,
    onlyShowDiscounts: false
};
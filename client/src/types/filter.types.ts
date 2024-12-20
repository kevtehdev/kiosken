export type SortOrder = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'none';

export interface FilterSettings {
    hideOutOfStock: boolean;
    sortOrder: SortOrder;
    onlyShowDiscounts: boolean;
}
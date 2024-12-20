import React, { createContext, useContext, useState } from 'react';
import { FilterSettings, SortOrder } from '../types/filter.types';

interface FilterContextType {
    filters: FilterSettings;
    updateFilters: (updates: Partial<FilterSettings>) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [filters, setFilters] = useState<FilterSettings>({
        hideOutOfStock: true,
        sortOrder: 'none',
        onlyShowDiscounts: false
    });

    const updateFilters = (updates: Partial<FilterSettings>) => {
        setFilters(prev => ({ ...prev, ...updates }));
    };

    return (
        <FilterContext.Provider value={{ filters, updateFilters }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};

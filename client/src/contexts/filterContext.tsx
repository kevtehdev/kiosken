import React, { createContext, useContext, useState, useCallback } from 'react';
import { FilterSettings } from '../types/filter.types';

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

    const updateFilters = useCallback((updates: Partial<FilterSettings>) => {
        setFilters(prev => ({
            ...prev,
            ...updates
        }));
    }, []); 

    const contextValue = {
        filters,
        updateFilters
    };

    return (
        <FilterContext.Provider value={contextValue}>
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
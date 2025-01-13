import { SortOrder } from '../types/filter.types';
import { API } from '@onslip/onslip-360-web-api';

type ProductWithDiscount = API.Product & {
    'discount-price'?: number;
}

type ExtendedProduct = ProductWithDiscount;

export const sortProducts = (
    products: number[],
    productData: Record<number, ExtendedProduct>,
    sortOrder: SortOrder
): number[] => {
    if (!products || products.length === 0) {
        return products;
    }

    if (Object.keys(productData).length === 0) {
        return products;
    }

    const productsToSort = [...products];
    
    return productsToSort.sort((a, b) => {
        const productA = productData[a];
        const productB = productData[b];

        if (!productA && !productB) return 0;
        if (!productA) return 1;
        if (!productB) return -1;

        switch (sortOrder) {
            case 'name-asc': {
                const nameA = productA.name || '';
                const nameB = productB.name || '';
                return nameA.localeCompare(nameB, 'sv');
            }
            
            case 'name-desc': {
                const nameA = productA.name || '';
                const nameB = productB.name || '';
                return nameB.localeCompare(nameA, 'sv');
            }
            
            case 'price-asc': {
                const priceA = typeof productA.price === 'number' ? productA.price :
                    typeof productA['discount-price'] === 'number' ? productA['discount-price'] : 0;
                const priceB = typeof productB.price === 'number' ? productB.price :
                    typeof productB['discount-price'] === 'number' ? productB['discount-price'] : 0;
                return priceA - priceB;
            }
            
            case 'price-desc': {
                const priceA = typeof productA.price === 'number' ? productA.price :
                    typeof productA['discount-price'] === 'number' ? productA['discount-price'] : 0;
                const priceB = typeof productB.price === 'number' ? productB.price :
                    typeof productB['discount-price'] === 'number' ? productB['discount-price'] : 0;
                return priceB - priceA;
            }
            
            case 'none':
            default:
                return 0;
        }
    });
};
import { 
    iceCreamOutline,
    restaurantOutline,
    beerOutline,
    bagHandleOutline,
    fastFoodOutline,
    cartOutline
} from 'ionicons/icons';

export const getIconForTab = (name: string): string => {
    const normalizedName = name.toLowerCase();
    
    const iconMap: Record<string, string> = {
        glass: iceCreamOutline,
        godis: bagHandleOutline,
        snacks: bagHandleOutline,
        dryck: beerOutline,
        läsk: beerOutline,
        frukost: fastFoodOutline,
        mackor: fastFoodOutline,
        lunch: restaurantOutline,
        mat: restaurantOutline,
    };

    return Object.entries(iconMap).find(([key]) => 
        normalizedName.includes(key))?.[1] || cartOutline;
};
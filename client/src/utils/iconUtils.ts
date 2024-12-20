import { 
    fastFoodOutline, 
    pizzaOutline, 
    beerOutline, 
    cafeOutline,
    wineOutline,
    restaurantOutline,
    basketOutline
} from 'ionicons/icons';

const categoryIcons: Record<string, string> = {
    'Mat': fastFoodOutline,
    'Pizza': pizzaOutline,
    'Öl': beerOutline,
    'Kaffe': cafeOutline,
    'Vin': wineOutline,
    'Lunch': restaurantOutline,
    'default': basketOutline
};

export const getIconForTab = (name: string): string => {
    return categoryIcons[name] || categoryIcons.default;
};

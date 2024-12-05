import React from 'react';
import {
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { 
    iceCreamOutline,
    restaurantOutline,
    beerOutline,
    bagHandleOutline,
    fastFoodOutline,
    cartOutline
} from 'ionicons/icons';
import { ButtonMap } from '../../contexts/apiContext';
import '../../styles/components/TabBar.css';

export const getIconForTab = (name: string) => {
    const normalizedName = name.toLowerCase();
    
    const iconMap: Record<string, string> = {
        glass: iceCreamOutline,
        godis: bagHandleOutline,
        snacks: bagHandleOutline,
        dryck: beerOutline,
        läsk: beerOutline,
        frukost: fastFoodOutline,
        macka: fastFoodOutline,
        lunch: restaurantOutline,
        mat: restaurantOutline,
    };

    return Object.entries(iconMap).find(([key]) => 
        normalizedName.includes(key))?.[1] || cartOutline;
};

interface TabBarProps {
    buttonMaps: ButtonMap[];
}

export const TabBar: React.FC<TabBarProps> = ({ buttonMaps }) => {
    const location = useLocation();
    const currentId = location.pathname.split('/').pop();

    const filteredMaps = buttonMaps.filter(map => 
        map.type === 'tablet-buttons' && 
        Array.isArray(map.buttons) && 
        map.buttons.length > 0 && 
        map.id !== undefined
    );

    return (
        <IonTabBar slot="bottom" className="modern-tab-bar">
            {filteredMaps.map((buttonMap) => {
                const isSelected = currentId === buttonMap.id?.toString();
                const icon = getIconForTab(buttonMap.name);
                
                return (
                    <IonTabButton
                        key={buttonMap.id}
                        tab={`tab-${buttonMap.id}`}
                        href={`/tabs/${buttonMap.id}`}
                        selected={isSelected}
                        className="tab-button"
                    >
                        <IonIcon 
                            icon={icon}
                            aria-hidden="true"
                        />
                        <IonLabel>{buttonMap.name}</IonLabel>
                    </IonTabButton>
                );
            })}
        </IonTabBar>
    );
};
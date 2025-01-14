import React from 'react';
import {
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { API } from '@onslip/onslip-360-web-api';
import { getIconForTab } from '../../utils/iconUtils';
import '../../styles/components/layout/TabBar.css';

interface TabBarProps {
    buttonMaps: API.ButtonMap[];
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
import React, { useRef } from 'react';
import {
    IonContent,
    IonToolbar,
    IonTitle,
    IonModal,
    IonButtons,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
    IonSelect,
    IonSelectOption,
} from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';
import { useFilters } from '../../contexts/filterContext';
import '../../styles/components/layout/SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
}) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const { filters, updateFilters } = useFilters();

    const dismiss = () => {
        modal.current?.dismiss();
        onClose();
    };

    return (
        <IonModal 
            id="settings-modal"
            isOpen={isOpen} 
            ref={modal}
            onDidDismiss={dismiss}
        >
            <IonContent>
                <IonToolbar>
                    <div className="toolbar-content">
                        <IonIcon icon={settingsOutline} className="settings-icon" />
                        <IonTitle>Inställningar</IonTitle>
                    </div>
                    <IonButtons slot="end">
                        <IonButton onClick={() => dismiss()}>
                            Stäng
                        </IonButton>
                    </IonButtons>
                </IonToolbar>

                <IonList>
                    {/* Sortering */}
                    <IonItem>
                        <IonLabel>Sortera efter</IonLabel>
                        <IonSelect
                            value={filters.sortOrder}
                            onIonChange={e => updateFilters({ sortOrder: e.detail.value })}
                        >
                            <IonSelectOption value="none">Standard</IonSelectOption>
                            <IonSelectOption value="price-asc">Billigast först</IonSelectOption>
                            <IonSelectOption value="price-desc">Dyrast först</IonSelectOption>
                            <IonSelectOption value="name-asc">Namn (A-Ö)</IonSelectOption>
                            <IonSelectOption value="name-desc">Namn (Ö-A)</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    {/* Filter toggles */}
                    <IonItem>
                        <IonLabel>Göm produkter som är slut</IonLabel>
                        <IonToggle
                            checked={filters.hideOutOfStock}
                            onIonChange={e => updateFilters({ hideOutOfStock: e.detail.checked })}
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel>Visa endast rabatterade</IonLabel>
                        <IonToggle
                            checked={filters.onlyShowDiscounts}
                            onIonChange={e => updateFilters({ onlyShowDiscounts: e.detail.checked })}
                        />
                    </IonItem>
                </IonList>
            </IonContent>
        </IonModal>
    );
};
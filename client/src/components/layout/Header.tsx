import React, { useState } from "react";
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonRouterLink,
    IonButton,
    useIonRouter,
    IonIcon,
} from "@ionic/react";
import { settingsOutline } from 'ionicons/icons';
import CartIcon from "../cart/CartIcon";
import { SettingsModal } from "./SettingsModal";
import '../../styles/components/layout/Header.css';

interface HeaderProps {
    title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const router = useIonRouter();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <IonHeader className="ion-no-border modern-header">
                <IonToolbar>
                    <div className="header-container">
                        <div
                            className="logo-container"
                            onClick={() => router.push("/")}
                        >
                            <img
                                src="/assets/onslip-brand-full.png"
                                alt="Onslip Logo"
                                className="header-logo"
                            />
                        </div>
                        <div className="header-nav">
                            <IonRouterLink
                                className="header-link"
                                routerLink="/campaigns"
                                routerDirection="none"
                            >
                                Kampanjer
                            </IonRouterLink>
                            <IonButtons slot="end">
                                                                <IonButton onClick={() => setIsSettingsOpen(true)}>
                                    <IonIcon icon={settingsOutline} />
                                </IonButton>
                                <CartIcon />
                            </IonButtons>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
};
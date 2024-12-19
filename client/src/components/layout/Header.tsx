import React from "react";
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonRouterLink,
    useIonRouter,
} from "@ionic/react";
import CartIcon from "../cart/CartIcon";
import '../../styles/components/layout/Header.css';

interface HeaderProps {
    title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const router = useIonRouter();

    return (
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
                        <IonButtons slot="end" className="cart-button">
                            <CartIcon />
                        </IonButtons>
                    </div>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

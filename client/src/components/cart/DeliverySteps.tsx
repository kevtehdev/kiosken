import React from 'react';
import { IonIcon } from "@ionic/react";
import {
    timeOutline,
    mailOutline,
    cardOutline,
    documentTextOutline,
} from "ionicons/icons";

export const DeliverySteps: React.FC = () => (
    <ul className="delivery-steps">
        <li className="delivery-step">
            <IonIcon icon={timeOutline} className="step-icon" />
            <span>Din beställning skickas direkt till vår dedikerade leveranspersonal</span>
        </li>
        <li className="delivery-step">
            <IonIcon icon={cardOutline} className="step-icon" />
            <span>Säker betalning via Viva Payments</span>
        </li>
        <li className="delivery-step">
            <IonIcon icon={mailOutline} className="step-icon" />
            <span>Du får orderbekräftelse och kvitto via e-post</span>
        </li>
        <li className="delivery-step">
            <IonIcon icon={documentTextOutline} className="step-icon" />
            <span>Din order levereras till vald leveransplats</span>
        </li>
    </ul>
);
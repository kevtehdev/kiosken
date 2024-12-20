import React from 'react';
import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import { Header } from "../layout/Header";

interface LoadingStateProps {
    message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
    <IonPage>
        <Header />
        <IonContent>
            <div className="loading-state">
                <IonSpinner name="crescent" />
                <p>{message}</p>
            </div>
        </IonContent>
    </IonPage>
);
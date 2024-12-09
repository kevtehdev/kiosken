import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonIcon,
    IonButton,
    IonSpinner,
    useIonToast,
} from "@ionic/react";
import { settingsOutline, checkmarkCircleOutline, alertCircleOutline } from "ionicons/icons";
import { useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { useApi } from "../contexts/apiContext";
import CredentialsDisplay, { OnslipCredentials } from "../components/config/CredentialsDisplay";
import "../styles/pages/Config.css";

const Config: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [credentials, setCredentials] = useState<OnslipCredentials | null>(null);
    const location = useLocation();
    const [presentToast] = useIonToast();
    const api = useApi();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');
        
        const hawkId = searchParams.get('hawkId');
        const key = searchParams.get('key');
        const realm = searchParams.get('realm');

        if (success === 'true' && hawkId && key && realm) {
            setStatus('success');
            setCredentials({
                hawkId: decodeURIComponent(hawkId),
                key: decodeURIComponent(key),
                realm: decodeURIComponent(realm)
            });
            presentToast({
                message: 'Anslutningen till Onslip lyckades!',
                duration: 3000,
                position: 'bottom',
                color: 'success',
            });
        } else if (error === 'true') {
            setStatus('error');
            presentToast({
                message: errorMessage || 'Något gick fel vid anslutning till Onslip',
                duration: 3000,
                position: 'bottom',
                color: 'danger',
            });
        }
    }, [location, presentToast]);

    const handleOnslipConnect = async () => {
        try {
            setStatus('loading');
            const response = await fetch('http://localhost:3000/api/oauth/authorize', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Kunde inte starta OAuth-flödet');
            }

            const data = await response.json();
            window.location.href = data.authorizationUrl;
        } catch (error) {
            setStatus('error');
            presentToast({
                message: 'Ett fel uppstod vid anslutning till Onslip',
                duration: 3000,
                position: 'bottom',
                color: 'danger',
            });
        }
    };

    const renderContent = () => {
        if (status === 'success' && credentials) {
            return (
                <div className="config-card">
                    <div className="config-alert success">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <span>Registreringen har lyckats!</span>
                    </div>
                    <CredentialsDisplay credentials={credentials} />
                </div>
            );
        }

        if (status === 'error') {
            return (
                <div className="config-card">
                    <h3>Onslip Integration</h3>
                    <p className="config-description">
                        Anslut din butik till Onslip för att synkronisera produkter, 
                        ordrar och betalningar.
                    </p>
                    <div className="config-alert error">
                        <IonIcon icon={alertCircleOutline} />
                        <span>Ett fel uppstod vid anslutning till Onslip</span>
                    </div>
                    <IonButton
                        expand="block"
                        onClick={handleOnslipConnect}
                        className="config-button"
                    >
                        Försök igen
                    </IonButton>
                </div>
            );
        }

        return (
            <div className="config-card">
                <h3>Onslip Integration</h3>
                <p className="config-description">
                    Anslut din butik till Onslip för att synkronisera produkter, 
                    ordrar och betalningar.
                </p>
                <IonButton
                    expand="block"
                    onClick={handleOnslipConnect}
                    disabled={status === 'loading'}
                    className="config-button"
                >
                    {status === 'loading' ? (
                        <>
                            <IonSpinner name="crescent" />
                            <span>Ansluter...</span>
                        </>
                    ) : (
                        'Anslut till Onslip'
                    )}
                </IonButton>
            </div>
        );
    };

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="config-container">
                    <section className="config-section">
                        {renderContent()}
                    </section>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Config;
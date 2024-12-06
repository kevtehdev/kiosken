import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    useIonToast,
} from "@ionic/react";
import { settingsOutline, checkmarkCircleOutline, alertCircleOutline } from "ionicons/icons";
import { useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { useApi } from "../contexts/apiContext";
import "../styles/pages/Config.css";

const Config: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const location = useLocation();
    const [presentToast] = useIonToast();
    const api = useApi();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (success === 'true') {
            setStatus('success');
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

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="config-container">
                    <section className="config-section">
                        <div className="section-header">
                            <IonIcon icon={settingsOutline} className="section-icon" />
                            <h2>Inställningar</h2>
                        </div>

                        <div className="config-card">
                            <h3>Onslip Integration</h3>
                            <p className="description">
                                Anslut din butik till Onslip för att synkronisera produkter, 
                                ordrar och betalningar.
                            </p>

                            {status === 'success' && (
                                <div className="status-message success">
                                    <IonIcon icon={checkmarkCircleOutline} />
                                    <span>Anslutningen till Onslip lyckades!</span>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="status-message error">
                                    <IonIcon icon={alertCircleOutline} />
                                    <span>Ett fel uppstod vid anslutning till Onslip</span>
                                </div>
                            )}

                            <IonButton
                                expand="block"
                                onClick={handleOnslipConnect}
                                disabled={status === 'loading'}
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
                    </section>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Config;
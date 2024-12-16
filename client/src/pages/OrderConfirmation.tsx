import { useEffect, useState } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    useIonToast,
    IonButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
} from '@ionic/react';
import {
    checkmarkCircleOutline,
    timeOutline,
    documentTextOutline,
    mailOutline,
    alertCircleOutline,
} from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { api, OrderDetails } from '../services/api';
import '../styles/pages/OrderConfirmation.css';

export default function OrderConfirmation() {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const location = useLocation();
    const history = useHistory();
    const [presentToast] = useIonToast();

    const showErrorToast = async (message: string) => {
        await presentToast({
            message,
            duration: 3000,
            position: 'bottom',
            color: 'danger',
            buttons: [
                {
                    text: 'Stäng',
                    role: 'cancel',
                },
            ],
        });
    };

    const handleRefresh = async (event: CustomEvent) => {
        console.log('=== Refreshing Order Details ===');
        try {
            const params = new URLSearchParams(location.search);
            const orderId = params.get('s');
            
            if (orderId) {
                setIsLoading(true);
                const refreshedOrderData = await api.getOrderDetails(orderId);
                setOrderDetails(refreshedOrderData);
                console.log('Order details refreshed successfully');
            }
        } catch (error) {
            console.error('Error refreshing order details:', error);
            await showErrorToast('Kunde inte uppdatera orderinformation');
        } finally {
            setIsLoading(false);
            event.detail.complete();
        }
    };

    const retryJournalEntry = async (orderId: string, orderData: OrderDetails) => {
        console.log('=== Retrying Journal Entry ===');
        console.log('Retry count:', retryCount);
        
        try {
            await api.createJournalEntry(orderId, orderData);
            console.log('Journal entry retry successful');
            setRetryCount(0); // Reset retry count on success
        } catch (error) {
            console.error('Journal entry retry failed:', error);
            if (retryCount < 3) {
                console.log('Scheduling retry attempt');
                setRetryCount(prev => prev + 1);
                setTimeout(() => retryJournalEntry(orderId, orderData), 2000);
            } else {
                console.error('Max retry attempts reached');
                await showErrorToast('Kunde inte skapa journalanteckning efter flera försök');
            }
        }
    };

    useEffect(() => {
        const processOrder = async () => {
            console.log('=== Processing Order in OrderConfirmation ===');
            const params = new URLSearchParams(location.search);
            const orderId = params.get('s');
            const status = params.get('status');

            console.log('URL Parameters:', { orderId, status });

            if (!orderId || status !== 'success') {
                console.log('Invalid order parameters, redirecting to cart');
                history.replace('/cart');
                return;
            }

            try {
                setIsLoading(true);
                console.log('Fetching order details for ID:', orderId);
                
                const orderData = await api.getOrderDetails(orderId);
                console.log('Received order details:', orderData);
                
                if (orderData.status === 'completed') {
                    console.log('Order is completed, creating journal entry');
                    try {
                        await api.createJournalEntry(orderId, orderData);
                        console.log('Journal entry created successfully');
                    } catch (journalError) {
                        console.error('Failed to create journal entry:', journalError);
                        // Start retry process for journal entry
                        retryJournalEntry(orderId, orderData);
                    }
                    
                    setOrderDetails(orderData);
                    console.log('Order processing completed successfully');
                    
                    await presentToast({
                        message: 'Orderbekräftelse har skickats till din e-post',
                        duration: 3000,
                        position: 'bottom',
                        color: 'success',
                    });
                } else {
                    console.warn('Order not completed, current status:', orderData.status);
                    throw new Error(`Ordern är i status: ${orderData.status}`);
                }
            } catch (error) {
                console.error('=== Order Processing Error ===');
                console.error('Error details:', error);
                
                const errorMessage = error instanceof Error ? error.message : 'Ett okänt fel uppstod';
                setError(errorMessage);
                
                await showErrorToast(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        processOrder();
    }, [location, history]);

    if (isLoading) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="confirmation-container loading">
                        <IonSpinner name="crescent" />
                        <div className="loading-message">
                            Bearbetar din order...
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="confirmation-container error">
                        <IonIcon icon={alertCircleOutline} className="error-icon" />
                        <h2>Ett fel uppstod</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <IonButton 
                                onClick={() => window.location.reload()} 
                                className="retry-button"
                            >
                                Försök igen
                            </IonButton>
                            <IonButton 
                                routerLink="/cart" 
                                className="back-button"
                                color="medium"
                            >
                                Återgå till varukorgen
                            </IonButton>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!orderDetails) {
        return null;
    }

    return (
        <IonPage>
            <Header />
            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="confirmation-container">
                    <div className="confirmation-header">
                        <IonIcon
                            icon={checkmarkCircleOutline}
                            className="success-icon"
                        />
                        <h1>Tack för din beställning!</h1>
                        <p className="order-id">Ordernummer: {orderDetails.orderId}</p>
                    </div>

                    <section className="confirmation-section">
                        <h2>Orderdetaljer</h2>
                        <div className="order-details">
                            <div className="detail-row">
                                <span>Leveransplats:</span>
                                <span>{orderDetails.deliveryLocation}</span>
                            </div>
                            <div className="detail-row">
                                <span>Kund:</span>
                                <span>{orderDetails.customerName}</span>
                            </div>
                            <div className="detail-row">
                                <span>E-post:</span>
                                <span>{orderDetails.customerEmail}</span>
                            </div>
                            <div className="detail-row total">
                                <span>Totalt belopp:</span>
                                <span>{orderDetails.totalAmount.toFixed(2)} kr</span>
                            </div>
                        </div>
                    </section>

                    <section className="confirmation-section">
                        <h2>Beställda produkter</h2>
                        <div className="order-items">
                            {orderDetails.items.map((item) => (
                                <div key={item.id} className="order-item">
                                    <div className="item-details">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-quantity">{item.quantity} st</span>
                                    </div>
                                    <span className="item-price">
                                        {item.totalPrice.toFixed(2)} kr
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="confirmation-section">
                        <h2>Nästa steg</h2>
                        <ul className="next-steps">
                            <li>
                                <IonIcon icon={mailOutline} />
                                <span>En orderbekräftelse har skickats till {orderDetails.customerEmail}</span>
                            </li>
                            <li>
                                <IonIcon icon={timeOutline} />
                                <span>Din beställning förbereds för leverans till {orderDetails.deliveryLocation}</span>
                            </li>
                            <li>
                                <IonIcon icon={documentTextOutline} />
                                <span>Du kommer att meddelas när leveransen är på väg</span>
                            </li>
                        </ul>
                    </section>

                    <div className="confirmation-actions">
                        <IonButton
                            expand="block"
                            routerLink="/products"
                            className="action-button"
                        >
                            Fortsätt handla
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
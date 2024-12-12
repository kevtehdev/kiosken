// client/src/pages/Cart.tsx
import { useState, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonList,
    IonButton,
    useIonToast,
    IonIcon,
    IonSpinner,
    IonModal,
} from "@ionic/react";
import {
    timeOutline,
    mailOutline,
    cardOutline,
    documentTextOutline,
    cartOutline,
    closeOutline,
} from "ionicons/icons";
import { useCart } from "../contexts/cartContext";
import CartItem from "../components/cart/CartItem";
import { UserList } from "../components/users/UserList";
import { Header } from "../components/layout/Header";
import { api } from "../services/api";
import { Customer } from "../contexts/userContext";
import "../styles/pages/Cart.css";

interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: string[];
}

interface CardDetails {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
}

export default function Cart() {
    const [deliveryLocation, setDeliveryLocation] = useState<Customer | undefined>();
    const [resources, setResources] = useState<any[]>([]);
    const { state, dispatch } = useCart();
    const [presentToast] = useIonToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [total, setTotal] = useState<number>(0);
    const [totalDiscount, setTotalDiscount] = useState<number>(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const [currentOrderId, setCurrentOrderId] = useState<string>('');
    
    // Add card details state
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        number: '',
        expMonth: '',
        expYear: '',
        cvc: ''
    });

    useEffect(() => {
        const loadResources = async () => {
            try {
                const fetchedResources = await api.getResources();
                setResources(fetchedResources);
            } catch (error) {
                console.error("Fel vid laddning av resurser:", error);
                await presentToast({
                    message: "Kunde inte ladda leveransplatser",
                    duration: 3000,
                    position: "bottom",
                    color: "danger",
                });
            }
        };
        loadResources();
    }, []);

    useEffect(() => {
        const calculateTotal = async () => {
            const total = await api.calcDiscountedTotal(state.items);
            let totalWithoutDiscount = state.items.reduce(
                (sum, item) => sum + (item.price || 0) * item.quantity,
                0
            );
            setTotal(total);
            setTotalDiscount(totalWithoutDiscount - total);
        };

        if (state.items.length > 0) {
            calculateTotal();
        } else {
            setTotal(0);
            setTotalDiscount(0);
        }
    }, [state.items]);

    const formatOrderItems = () => {
        return state.items.map(
            (item) =>
                `${item["product-name"]}: ${item.quantity} st - ${(
                    (item.price ?? 0) * item.quantity
                ).toFixed(2)} kr`
        );
    };

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateCardDetails = () => {
        const { number, expMonth, expYear, cvc } = cardDetails;
        return (
            number.replace(/\s/g, '').length === 16 &&
            expMonth.length === 2 &&
            expYear.length === 2 &&
            cvc.length === 3
        );
    };

    const getPaymentStatusMessage = () => {
        switch (paymentStatus) {
            case 'processing':
                return 'Bearbetar din betalning...';
            case 'completed':
                return 'Betalning genomförd!';
            case 'failed':
                return 'Betalningen misslyckades.';
            default:
                return 'Förbereder betalning...';
        }
    };

    const clearCart = () => {
        dispatch({ type: "CLEAR_CART" });
        setCurrentOrderId('');
        setPaymentStatus('');
        setShowPaymentModal(false);
    };

    async function handleSendOrder() {
        if (!deliveryLocation || state.items.length === 0 || !validateCardDetails()) return;

        setIsSubmitting(true);
        try {
            const orderReference = crypto.randomUUID();
            const orderName = `Leverans till ${deliveryLocation.name}`;

            const deliveryDetails: DeliveryDetails = {
                orderId: orderReference,
                orderName,
                customerName: deliveryLocation.name,
                customerEmail: deliveryLocation.email!,
                deliveryLocation: deliveryLocation.name,
                totalAmount: total,
                items: formatOrderItems(),
            };

            const paymentRequest = {
                orderReference,
                items: state.items,
                deliveryDetails,
                customerId: deliveryLocation.id,
                totalAmount: total,
                order: {
                    location: 1,
                    state: "requested",
                    name: orderName,
                    items: state.items,
                    owner: deliveryLocation.id,
                    type: "take-out",
                    "order-reference": orderReference,
                    description: `Leveransplats: ${deliveryLocation.name}`,
                },
            };

            setCurrentOrderId(orderReference);
            setShowPaymentModal(true);
            setPaymentStatus('processing');

            const response = await api.processPayment(paymentRequest);
            if (response.status === 'failed') {
                throw new Error(response.message || 'Betalningen misslyckades');
            }

            // Start payment status checking
            const statusCheck = setInterval(async () => {
                try {
                    const status = await api.checkPaymentStatus(orderReference);
                    setPaymentStatus(status.status);

                    if (status.status === 'completed') {
                        clearInterval(statusCheck);
                        clearCart();
                        await presentToast({
                            message: 'Betalning genomförd! Kvitto skickas via e-post.',
                            duration: 3000,
                            position: "bottom",
                            color: "success",
                        });
                    } else if (status.status === 'failed') {
                        clearInterval(statusCheck);
                        setShowPaymentModal(false);
                        await presentToast({
                            message: status.message || 'Betalningen misslyckades. Försök igen.',
                            duration: 3000,
                            position: "bottom",
                            color: "danger",
                        });
                    }
                } catch (error) {
                    console.error('Fel vid statuskontroll:', error);
                }
            }, 2000);

        } catch (error) {
            console.error("Ett fel uppstod:", error);
            await presentToast({
                message: error instanceof Error ? error.message : "Ett fel uppstod när beställningen skulle skickas",
                duration: 3000,
                position: "bottom",
                color: "danger",
            });
            setShowPaymentModal(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="cart-container">
                    {/* Leveransplats-sektion */}
                    <section className="cart-section">
                        <div className="cart-section-header">
                            <h2 className="section-title">Välj leveransplats</h2>
                        </div>
                        <div className="cart-section-content">
                            <UserList onCustomerSelect={setDeliveryLocation} />
                        </div>
                    </section>

                    {/* Produktlista */}
                    <section className="cart-section">
                        <div className="cart-section-header">
                            <h2 className="section-title">Din varukorg</h2>
                        </div>
                        <div className="cart-section-content">
                            {state.items.length > 0 ? (
                                <>
                                    <IonList className="cart-list">
                                        {state.items.map((item) => (
                                            <CartItem
                                                key={item.product}
                                                item={item}
                                            />
                                        ))}
                                    </IonList>

                                    <div className="cart-total">
                                        <div className="cart-total-header">
                                            <span className="cart-total-label">
                                                Totalt att betala
                                            </span>
                                            <div className="cart-total-container">
                                                {totalDiscount > 0 && (
                                                    <span className="cart-total-discount">
                                                        -{totalDiscount.toFixed(2)} kr
                                                    </span>
                                                )}
                                                <span className="cart-total-amount">
                                                    {total.toFixed(2)} kr
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-cart">
                                    <IonIcon
                                        icon={cartOutline}
                                        className="empty-cart-icon"
                                    />
                                    <h3 className="empty-cart-text">
                                        Din varukorg är tom
                                    </h3>
                                    <p className="empty-cart-subtext">
                                        Lägg till produkter för att komma igång med din beställning
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Kortbetalning */}
                    {state.items.length > 0 && (
                        <section className="cart-section">
                            <div className="cart-section-header">
                                <h2 className="section-title">Betalning</h2>
                            </div>
                            <div className="cart-section-content">
                                <div className="payment-form">
                                    <div className="form-group">
                                        <label htmlFor="cardNumber">Kortnummer</label>
                                        <input
                                            type="text"
                                            id="cardNumber"
                                            name="number"
                                            value={cardDetails.number}
                                            onChange={handleCardInputChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={16}
                                            className="card-input"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="expMonth">Månad</label>
                                            <input
                                                type="text"
                                                id="expMonth"
                                                name="expMonth"
                                                value={cardDetails.expMonth}
                                                onChange={handleCardInputChange}
                                                placeholder="MM"
                                                maxLength={2}
                                                className="card-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="expYear">År</label>
                                            <input
                                                type="text"
                                                id="expYear"
                                                name="expYear"
                                                value={cardDetails.expYear}
                                                onChange={handleCardInputChange}
                                                placeholder="YY"
                                                maxLength={2}
                                                className="card-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="cvc">CVC</label>
                                            <input
                                                type="text"
                                                id="cvc"
                                                name="cvc"
                                                value={cardDetails.cvc}
                                                onChange={handleCardInputChange}
                                                placeholder="123"
                                                maxLength={3}
                                                className="card-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Leveransinformation */}
                    {state.items.length > 0 && (
                        <section className="cart-section">
                            <div className="cart-section-header">
                                <h2 className="section-title">Om leveransprocessen</h2>
                            </div>
                            <div className="cart-section-content">
                                <ul className="delivery-steps">
                                    <li className="delivery-step">
                                        <IonIcon icon={timeOutline} className="step-icon" />
                                        <span>Din beställning skickas direkt till vår dedikerade leveranspersonal</span>
                                    </li>
                                    <li className="delivery-step">
                                        <IonIcon icon={cardOutline} className="step-icon" />
                                        <span>Säker kortbetalning direkt på sidan</span>
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
                            </div>
                        </section>
                    )}

                    {/* Betalningsmodal */}
                    <IonModal isOpen={showPaymentModal} onDidDismiss={() => setShowPaymentModal(false)}>
                        <div className="payment-modal">
                            <div className="payment-modal-header">
                                <h2>Betalning pågår</h2>
                                <IonButton 
                                    fill="clear" 
                                    onClick={() => setShowPaymentModal(false)}
                                >
                                    <IonIcon icon={closeOutline} />
                                </IonButton>
                            </div>
                            <div className="payment-modal-content">
                                <div className="payment-status">
                                    <IonSpinner name="circular" />
                                    <p>{getPaymentStatusMessage()}</p>
                                </div>
                                <div className="payment-details">
                                    <p>Belopp: {total.toFixed(2)} kr</p>
                                    <p>Order ID: {currentOrderId}</p>
                                    </div>
                            </div>
                        </div>
                    </IonModal>

                    {/* Knappar */}
                    {state.items.length > 0 && (
                        <div className="cart-actions">
                            <IonButton
                                expand="block"
                                className="action-button"
                                color="danger"
                                onClick={() => dispatch({ type: "CLEAR_CART" })}
                                disabled={isSubmitting}
                            >
                                Rensa varukorg
                            </IonButton>

                            <IonButton
                                expand="block"
                                className="action-button"
                                onClick={handleSendOrder}
                                disabled={
                                    !deliveryLocation || 
                                    state.items.length === 0 || 
                                    isSubmitting || 
                                    !validateCardDetails()
                                }
                            >
                                {isSubmitting ? (
                                    <div className="loading-spinner">
                                        <IonSpinner name="crescent" />
                                        <span>Processar betalning...</span>
                                    </div>
                                ) : !deliveryLocation ? (
                                    "Välj leveransplats först"
                                ) : !validateCardDetails() ? (
                                    "Fyll i kortuppgifter"
                                ) : (
                                    `Betala (${total.toFixed(2)} kr)`
                                )}
                            </IonButton>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}
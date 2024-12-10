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
} from "@ionic/react";
import {
    timeOutline,
    mailOutline,
    cardOutline,
    documentTextOutline,
    cartOutline,
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

export default function Cart() {
    const [deliveryLocation, setDeliveryLocation] = useState<
        Customer | undefined
    >();
    const [resources, setResources] = useState<any[]>([]);
    const { state, dispatch } = useCart();
    const [presentToast] = useIonToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [total, setTotal] = useState<number>(0);
    const [totalDiscount, setTotalDiscount] = useState<number>(0);

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

    async function handleSendOrder() {
        if (!deliveryLocation || state.items.length === 0) return;

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

            await api.processPayment({
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
                    description: `Leveransplats: ${deliveryLocation.name} | Levereras av: ID 6`,
                },
            });

            dispatch({ type: "CLEAR_CART" });
            await presentToast({
                message: `Din beställning är mottagen och behandlas nu.`,
                duration: 3000,
                position: "bottom",
                color: "success",
            });
        } catch (error) {
            console.error("Ett fel uppstod:", error);
            await presentToast({
                message: "Ett fel uppstod när beställningen skulle skickas",
                duration: 3000,
                position: "bottom",
                color: "danger",
            });
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
                            <h2 className="section-title">
                                Välj leveransplats
                            </h2>
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
                                                        -
                                                        {totalDiscount.toFixed(
                                                            2
                                                        )}{" "}
                                                        kr
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
                                        Lägg till produkter för att komma igång
                                        med din beställning
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Leveransinformation */}
                    {state.items.length > 0 && (
                        <section className="cart-section">
                            <div className="cart-section-header">
                                <h2 className="section-title">
                                    Om leveransprocessen
                                </h2>
                            </div>
                            <div className="cart-section-content">
                                <ul className="delivery-steps">
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={timeOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Din beställning skickas direkt till
                                            vår dedikerade leveranspersonal
                                        </span>
                                    </li>
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={mailOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Du får en orderbekräftelse via
                                            e-post
                                        </span>
                                    </li>
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={cardOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Betala enkelt med kort vid leverans
                                        </span>
                                    </li>
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={documentTextOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Kvitto skickas till din e-post efter
                                            betalning
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    )}

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
                                    isSubmitting
                                }
                            >
                                {isSubmitting ? (
                                    <div className="loading-spinner">
                                        <IonSpinner name="crescent" />
                                        <span>Skickar beställning...</span>
                                    </div>
                                ) : !deliveryLocation ? (
                                    "Välj leveransplats först"
                                ) : (
                                    `Skicka beställning till ${deliveryLocation.name}`
                                )}
                            </IonButton>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

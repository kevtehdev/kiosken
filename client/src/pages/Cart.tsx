import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonList,
    IonIcon,
    useIonToast,
} from "@ionic/react";
import { cartOutline } from "ionicons/icons";
import { useLocation } from "react-router-dom";
import { useCart } from "../contexts/cartContext";
import { CartItem } from "../components/cart/CartItem";
import { CartActions } from "../components/cart/CartActions";
import { CartSummary } from "../components/cart/CartSummary";
import { DeliverySteps } from "../components/cart/DeliverySteps";
import { UserList } from "../components/users/UserList";
import { Header } from "../components/layout/Header";
import { api } from "../services/api";
import { Customer } from "../contexts/userContext";
import { DeliveryDetails } from "../types";
import { API } from "@onslip/onslip-360-web-api";
import { CartItemType } from "../types/payment.types";
import "../styles/pages/Cart.css";

export default function Cart() {
    const [deliveryLocation, setDeliveryLocation] = useState<Customer | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { state, dispatch } = useCart();
    const [presentToast] = useIonToast();
    const [total, setTotal] = useState<number>(0);
    const [totalDiscount, setTotalDiscount] = useState<number>(0);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get("status");
        const orderId = params.get("s");

        if (status && orderId) {
            if (status === "success") {
                dispatch({ type: "CLEAR_CART" });
                presentToast({
                    message: "Betalning genomförd! Kvitto skickas via e-post.",
                    duration: 3000,
                    position: "bottom",
                    color: "success",
                });
            } else if (status === "canceled") {
                presentToast({
                    message: "Betalningen avbröts.",
                    duration: 3000,
                    position: "bottom",
                    color: "warning",
                });
            }
        }
    }, [location, dispatch, presentToast]);

    useEffect(() => {
        const calculateTotal = async () => {
            if (state.items.length > 0) {
                const calculatedTotal = await api.calcDiscountedTotal(state.items);
                const totalWithoutDiscount = state.items.reduce(
                    (sum, item) => sum + (item.price || 0) * item.quantity,
                    0
                );
                setTotal(calculatedTotal);
                setTotalDiscount(totalWithoutDiscount - calculatedTotal);
            } else {
                setTotal(0);
                setTotalDiscount(0);
            }
        };

        calculateTotal();
    }, [state.items]);

    const formatOrderItems = () => {
        return state.items
            .filter((item): item is CartItemType => 
                item.product !== undefined && 
                typeof item.product === 'number'
            )
            .map((item) => ({
                id: item.product.toString(),
                name: item["product-name"],
                quantity: item.quantity,
                price: item.price || 0,
                totalPrice: (item.price || 0) * item.quantity,
            }));
    };

    const handleClearCart = () => {
        dispatch({ type: "CLEAR_CART" });
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

            const validItems = state.items.filter(
                (item): item is CartItemType => 
                item.product !== undefined && 
                typeof item.product === 'number'
            );

            const order: API.Order = {
                location: 1,
                state: "requested",
                name: orderName,
                items: validItems,
                owner: deliveryLocation.id,
                type: "take-out",
                "order-reference": orderReference,
                description: `Leveransplats: ${deliveryLocation.name}`,
            };

            const paymentRequest = {
                orderReference,
                items: validItems,
                deliveryDetails,
                customerId: deliveryLocation.id,
                totalAmount: total,
                order,
            };

            const response = await api.processPayment(paymentRequest);

            if (response.status === "failed") {
                throw new Error(response.message || "Betalningen kunde inte initieras");
            }

            if (response.transactionId) {
                window.location.href = `https://demo.vivapayments.com/web2?ref=${response.transactionId}`;
            } else {
                throw new Error("Ingen checkout-URL mottagen");
            }
        } catch (error) {
            console.error("Ett fel uppstod:", error);
            await presentToast({
                message: error instanceof Error ? error.message : "Ett fel uppstod",
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
                    {/* Delivery Location Section */}
                    <section className="cart-section">
                        <div className="cart-section-header">
                            <h2 className="section-title">Välj leveransplats</h2>
                        </div>
                        <div className="cart-section-content">
                            <UserList onCustomerSelect={setDeliveryLocation} />
                        </div>
                    </section>

                    {/* Cart Items Section */}
                    <section className="cart-section">
                        <div className="cart-section-header">
                            <h2 className="section-title">Din varukorg</h2>
                        </div>
                        <div className="cart-section-content">
                            {state.items.length > 0 ? (
                                <>
                                    <IonList className="cart-list">
                                        {state.items
                                            .filter((item): item is CartItemType => 
                                                item.product !== undefined && 
                                                typeof item.product === 'number'
                                            )
                                            .map((item) => (
                                                <CartItem
                                                    key={item.product}
                                                    item={item}
                                                />
                                            ))}
                                    </IonList>

                                    <CartSummary
                                        total={total}
                                        totalDiscount={totalDiscount}
                                    />
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

                    {state.items.length > 0 && (
                        <>
                            <section className="cart-section">
                                <div className="cart-section-header">
                                    <h2 className="section-title">Om leveransprocessen</h2>
                                </div>
                                <div className="cart-section-content">
                                    <DeliverySteps />
                                </div>
                            </section>

                            <CartActions
                                isSubmitting={isSubmitting}
                                hasDeliveryLocation={!!deliveryLocation}
                                itemsCount={state.items.length}
                                total={total}
                                onClearCart={handleClearCart}
                                onSendOrder={handleSendOrder}
                            />
                        </>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}
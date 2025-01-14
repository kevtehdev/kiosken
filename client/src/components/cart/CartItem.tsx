import React, { useEffect, useState } from "react";
import { IonButton, IonItem, IonIcon, IonLabel, IonNote } from "@ionic/react";
import { add, remove, trash } from "ionicons/icons";
import { useCart } from "../../contexts/cartContext";
import { api } from "../../services/api";
import { API } from "@onslip/onslip-360-web-api";
import "../../styles/components/cart/CartItem.css";

interface CartItemProps {
    item: API.Item & {
        'product-name': string;
        product: number;
    };
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { dispatch } = useCart();
    const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

    useEffect(() => {
        async function fetchDiscountedPrice() {
            if (!item.price || !item.product) return;
            
            try {
                const response = await api.calculateDiscount({
                    originalPrice: item.price,  // Ändrat: Skickar bara originalpriset utan multiplikation
                    campaign: { productId: item.product },
                });
                setDiscountedPrice(response.discountedPrice);
            } catch (error) {
                console.error("Fel vid hämtning av rabatterat pris:", error);
            }
        }

        fetchDiscountedPrice();
    }, [item.price, item.product]); // Tagit bort item.quantity från dependencies

    const handleIncrement = () => {
        if (!item.product) return;
        
        dispatch({
            type: "UPDATE_QUANTITY",
            payload: {
                product: item.product,
                quantity: item.quantity + 1,
            },
        });
    };

    const handleDecrement = () => {
        if (!item.product) return;

        if (item.quantity > 1) {
            dispatch({
                type: "UPDATE_QUANTITY",
                payload: {
                    product: item.product,
                    quantity: item.quantity - 1,
                },
            });
        } else {
            dispatch({ type: "REMOVE_ITEM", payload: item.product });
        }
    };

    const handleRemove = () => {
        if (!item.product) return;
        dispatch({ type: "REMOVE_ITEM", payload: item.product });
    };

    const totalPrice = (item.price || 0) * item.quantity;
    const itemDiscountedPrice = discountedPrice !== null ? discountedPrice * item.quantity : null;
    const showDiscount = discountedPrice !== null && discountedPrice < (item.price || 0);

    return (
        <IonItem className="cart-item">
            <div className="cart-item__content">
                <div className="cart-item__info">
                    <IonLabel className="cart-item__name">
                        {item["product-name"]} {item.quantity} st
                    </IonLabel>
                    <div slot="end">
                        {showDiscount ? (
                            <div className="cart-item-price-container">
                                <IonNote className="cart-item__price">
                                    {totalPrice.toFixed(2)} kr
                                </IonNote>
                                {itemDiscountedPrice !== null && (
                                    <IonNote className="reduced-price">
                                        {itemDiscountedPrice.toFixed(2)} kr
                                    </IonNote>
                                )}
                            </div>
                        ) : (
                            <IonNote className="cart-item__price">
                                {totalPrice.toFixed(2)} kr
                            </IonNote>
                        )}
                    </div>
                </div>
                <div className="cart-item__controls">
                    <IonButton
                        className="quantity-button"
                        size="small"
                        onClick={handleDecrement}
                    >
                        <IonIcon icon={remove} />
                    </IonButton>
                    <IonButton
                        className="quantity-button"
                        size="small"
                        onClick={handleIncrement}
                    >
                        <IonIcon icon={add} />
                    </IonButton>
                    <IonButton
                        className="delete-button"
                        color="danger"
                        size="small"
                        onClick={handleRemove}
                    >
                        <IonIcon icon={trash} />
                    </IonButton>
                </div>
            </div>
        </IonItem>
    );
};
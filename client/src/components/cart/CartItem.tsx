import { IonButton, IonItem, IonIcon, IonLabel, IonNote } from "@ionic/react";
import { add, remove, trash } from "ionicons/icons";
import { useCart } from "../../contexts/cartContext";
import { CartItem } from "../../types";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/components/CartItem.css";
import { API } from "@onslip/onslip-360-web-api";

interface CartItemProps {
    item: API.Item;
}

export default function CartItemComponent({ item }: CartItemProps) {
    const { dispatch } = useCart();
    const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

    useEffect(() => {
        async function fetchDiscountedPrice() {
            try {
                const response = await api.calculateDiscount({
                    originalPrice: (item.price || 0) * item.quantity,
                    campaign: { productId: item.product },
                });
                setDiscountedPrice(response.discountedPrice);
            } catch (error) {
                console.error("Fel vid hämtning av rabatterat pris:", error);
            }
        }

        if (item.price) {
            fetchDiscountedPrice();
        }
    }, [item]);

    const handleIncrement = () => {
        dispatch({
            type: "UPDATE_QUANTITY",
            payload: {
                product: item.product!,
                quantity: item.quantity + 1,
            },
        });
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            dispatch({
                type: "UPDATE_QUANTITY",
                payload: {
                    product: item.product!,
                    quantity: item.quantity - 1,
                },
            });
        } else {
            dispatch({ type: "REMOVE_ITEM", payload: item.product! });
        }
    };

    const totalPrice = (item.price || 0) * item.quantity;
    const discount =
        discountedPrice !== null ? totalPrice - discountedPrice : 0;

    return (
        <IonItem className="cart-item">
            <div className="cart-item__content">
                <div className="cart-item__info">
                    <IonLabel className="cart-item__name">
                        {item["product-name"]} {item.quantity} st
                    </IonLabel>
                    <div slot="end">
                        {discount > 0 ? (
                            <div className="cart-item-price-container">
                                <IonNote className="cart-item__price">
                                    {totalPrice.toFixed(2)} kr
                                </IonNote>
                                <IonNote className="reduced-price">
                                    -{discount.toFixed(2)} kr
                                </IonNote>
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
                        onClick={() =>
                            dispatch({
                                type: "REMOVE_ITEM",
                                payload: item.product!,
                            })
                        }
                    >
                        <IonIcon icon={trash} />
                    </IonButton>
                </div>
            </div>
        </IonItem>
    );
}

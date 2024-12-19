import React from 'react';
import { IonButton, IonSpinner } from "@ionic/react";
import { MESSAGES } from '../../constants/messages';

interface CartActionsProps {
    isSubmitting: boolean;
    hasDeliveryLocation: boolean;
    itemsCount: number;
    total: number;
    onClearCart: () => void;
    onSendOrder: () => void;
}

export const CartActions: React.FC<CartActionsProps> = ({
    isSubmitting,
    hasDeliveryLocation,
    itemsCount,
    total,
    onClearCart,
    onSendOrder
}) => (
    <div className="cart-actions">
        <IonButton
            expand="block"
            className="action-button"
            color="danger"
            onClick={onClearCart}
            disabled={isSubmitting}
        >
            {MESSAGES.ACTIONS.CLEAR_CART}
        </IonButton>

        <IonButton
            expand="block"
            className="action-button"
            onClick={onSendOrder}
            disabled={!hasDeliveryLocation || itemsCount === 0 || isSubmitting}
        >
            {isSubmitting ? (
                <div className="loading-spinner">
                    <IonSpinner name="crescent" />
                    <span>{MESSAGES.LOADING.PAYMENT}</span>
                </div>
            ) : !hasDeliveryLocation ? (
                MESSAGES.ACTIONS.SELECT_DELIVERY
            ) : (
                `${MESSAGES.ACTIONS.PROCEED_TO_PAYMENT} (${total.toFixed(2)} kr)`
            )}
        </IonButton>
    </div>
);

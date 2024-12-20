import React from 'react';
import { IonIcon, IonText, IonButton } from "@ionic/react";
import { motion } from "framer-motion";

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: {
        text: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action
}) => (
    <motion.div
        className="empty-state-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
    >
        <IonIcon icon={icon} className="empty-state-icon" aria-hidden="true" />
        <IonText>
            <h2>{title}</h2>
            <p>{description}</p>
        </IonText>
        {action && (
            <IonButton onClick={action.onClick}>
                {action.text}
            </IonButton>
        )}
    </motion.div>
);
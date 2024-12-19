import React from "react";
import {
    IonPage,
    IonContent,
    IonIcon,
} from "@ionic/react";
import { ticketOutline } from "ionicons/icons";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../components/layout/Header";
import { LoadingState } from "../components/common/LoadingState";
import { EmptyState } from "../components/common/EmptyState";
import { CampaignSection } from "../components/campaign/CampaignSection";
import { useCampaigns } from "../hooks/useCampaigns";
import { MESSAGES } from "../constants/messages";
import "../styles/pages/Campaign.css";

export default function Campaign() {
    const { campaigns, products, loading, error } = useCampaigns();

    if (loading) {
        return <LoadingState message={MESSAGES.LOADING.CAMPAIGNS} />;
    }

    if (error) {
        return (
            <EmptyState
                icon={ticketOutline}
                title="Ett fel uppstod"
                description={error}
            />
        );
    }

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="container">
                    <AnimatePresence mode="sync">
                        {campaigns.length === 0 ? (
                            <EmptyState
                                icon={ticketOutline}
                                title={MESSAGES.EMPTY_STATES.CAMPAIGNS.TITLE}
                                description={MESSAGES.EMPTY_STATES.CAMPAIGNS.DESCRIPTION}
                            />
                        ) : (
                            campaigns.map((campaign, index) => (
                                <CampaignSection
                                    key={campaign.id}
                                    campaign={campaign}
                                    products={products}
                                    index={index}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
}
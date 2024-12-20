import React from 'react';
import { IonIcon, IonBadge } from "@ionic/react";
import { ticketOutline } from "ionicons/icons";
import { motion } from "framer-motion";
import { Campaign } from '../../types';

interface CampaignBannerProps {
    campaign: Campaign;
    productCount: number;
}

export const CampaignBanner: React.FC<CampaignBannerProps> = ({
    campaign,
    productCount,
}) => {
    const getBannerText = () => {
        switch (campaign.type) {
            case "percentage":
                return `${campaign["discount-rate"]}% rabatt på utvalda produkter`;
            case "fixed-amount":
                return `Spara ${campaign.amount}kr på utvalda produkter`;
            case "fixed-price":
                return `Just nu endast ${campaign.amount}kr`;
            case "cheapest-free":
                return "Köp flera - Få den billigaste på köpet!";
            default:
                return campaign.name;
        }
    };

    return (
        <motion.div
            className="campaign-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="campaign-banner-content">
                <IonIcon
                    icon={ticketOutline}
                    className="campaign-banner-icon"
                    aria-hidden="true"
                />
                <div className="campaign-banner-text">
                    <div className="campaign-banner-title">
                        <h3>{campaign.name}</h3>
                        <IonBadge color="primary">
                            {productCount} produkter
                        </IonBadge>
                    </div>
                    <p>{getBannerText()}</p>
                </div>
            </div>
        </motion.div>
    );
};

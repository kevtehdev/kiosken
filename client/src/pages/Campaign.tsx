import React, { useMemo } from "react";
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
import { useFilters } from "../contexts/filterContext";
import { useStock } from "../hooks/useStock";
import { sortProducts } from "../utils/sortUtils";
import { MESSAGES } from "../constants/messages";
import { Campaign as CampaignType, Product } from "../types";
import { API } from '@onslip/onslip-360-web-api';
import "../styles/pages/Campaign.css";

type ProductWithDiscount = API.Product & {
    'discount-price'?: number;
}

type ExtendedProduct = ProductWithDiscount;

export default function Campaign() {
    const { campaigns, products: apiProducts, loading: campaignLoading, error } = useCampaigns();
    const { filters } = useFilters();
    const { stock, loading: stockLoading } = useStock();

    const productData = useMemo(() => {
        if (!apiProducts) {
            return {} as Record<number, ExtendedProduct>;
        }

        const result: Record<number, ExtendedProduct> = {};
        for (const [key, product] of Object.entries(apiProducts)) {
            const id = parseInt(key);
            if (!isNaN(id) && product) {
                result[id] = {
                    ...product,
                    id,
                    'discount-price': (product as ProductWithDiscount)['discount-price']
                };
            }
        }

        return result;
    }, [apiProducts]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.map(campaign => {
            let productIds = campaign.rules.flatMap(rule => rule.products);

            // Apply stock filter
            if (filters.hideOutOfStock && stock?.length) {
                productIds = productIds.filter((productId) => {
                    const stockItem = stock.find(item => item.id === productId);
                    return stockItem?.quantity !== undefined && stockItem.quantity > 0;
                });
            }

            // Apply discount filter
            if (filters.onlyShowDiscounts) {
                productIds = productIds.filter((productId) => {
                    const product = productData[productId];
                    return product && 
                        typeof product['discount-price'] === 'number' && 
                        product['discount-price'] > 0;
                });
            }

            // Apply sorting
            if (filters.sortOrder !== "none" && productIds.length > 0) {
                productIds = sortProducts(productIds, productData, filters.sortOrder);
            }

            // Create a new campaign object with filtered products in rules
            const filteredCampaign: CampaignType = {
                ...campaign,
                rules: [{
                    products: productIds
                }]
            };

            return {
                campaign: filteredCampaign,
                hasProducts: productIds.length > 0
            };
        }).filter(item => item.hasProducts)
        .map(item => item.campaign);
    }, [campaigns, stock, filters, productData]);

    if (campaignLoading || stockLoading) {
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
                        {filteredCampaigns.length === 0 ? (
                            <EmptyState
                                icon={ticketOutline}
                                title={MESSAGES.EMPTY_STATES.CAMPAIGNS.TITLE}
                                description={MESSAGES.EMPTY_STATES.CAMPAIGNS.DESCRIPTION}
                            />
                        ) : (
                            filteredCampaigns.map((campaign, index) => {
                                const campaignProducts = Object.values(productData)
                                    .filter(product => 
                                        campaign.rules[0].products.includes(product.id as number)
                                    );

                                return (
                                    <CampaignSection
                                        key={campaign.id}
                                        campaign={campaign}
                                        products={campaignProducts}
                                        index={index}
                                    />
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
}
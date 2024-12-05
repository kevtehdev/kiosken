import React, { useEffect, useState } from "react";
import {
    IonPage,
    IonContent,
    IonText,
    IonSpinner,
    IonIcon,
    IonBadge,
} from "@ionic/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { ProductCard } from "../components/products/ProductCard";
import { Header } from "../components/layout/Header";
import { ticketOutline } from "ionicons/icons";
import "../styles/pages/Campaign.css";

interface Campaign {
    id: number;
    name: string;
    type: string;
    'discount-rate'?: number;
    amount?: number;
    rules: Array<{
        products: number[];
    }>;
}

interface CampaignBannerProps {
    campaign: Campaign;
    productCount: number;
}

const CampaignBanner: React.FC<CampaignBannerProps> = ({
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

interface Product {
    id: number;
    name: string;
    price?: number;
}

interface CampaignSectionProps {
    campaign: Campaign;
    products: Product[];
    index: number;
}

const CampaignSection: React.FC<CampaignSectionProps> = ({ campaign, products, index }) => {
    const allCampaignProducts = campaign.rules.flatMap((rule) => rule.products);
    const validProducts = allCampaignProducts
        .map((productId) => products.find((p) => p.id === productId))
        .filter((product): product is Product => product !== undefined);

    return (
        <motion.section
            className="campaign-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <CampaignBanner
                campaign={campaign}
                productCount={validProducts.length}
            />

            <div className="campaign-products">
                <div className="product-grid">
                    {validProducts.map((product, productIndex) => (
                        <ProductCard
                            key={product.id}
                            productId={product.id}
                            index={productIndex}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default function Campaign() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [campaignsRes, productsRes] = await Promise.all([
                    api.getCampaigns(),
                    api.getProducts()
                ]);
                setCampaigns(campaignsRes);
                setProducts(Object.values(productsRes.products));
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="loading-state">
                        <IonSpinner name="crescent" />
                        <p>Laddar kampanjer...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="container">
                    <AnimatePresence mode="sync">
                        {campaigns.length === 0 ? (
                            <motion.div
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IonIcon
                                    icon={ticketOutline}
                                    className="empty-state-icon"
                                />
                                <IonText>
                                    <h2>Inga kampanjer tillgängliga</h2>
                                    <p>
                                        Det finns inga aktiva kampanjer just nu.
                                    </p>
                                </IonText>
                            </motion.div>
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
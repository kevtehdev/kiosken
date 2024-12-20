import React from "react";
import { useParams } from "react-router-dom";
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonBadge
} from "@ionic/react";
import { useApi } from "../contexts/apiContext";
import { ProductCard } from "../components/products/ProductCard";
import { Header } from "../components/layout/Header";
import { refreshOutline } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getIconForTab } from '../components/layout/TabBar';
import '../styles/pages/TabPage.css';

// Interface för TabSection props
interface TabSectionProps {
    products: number[];
    name: string;
}

// Tab-sektion komponent för att visa produktkategorier
const TabSection: React.FC<TabSectionProps> = ({ products, name }) => {
    const tabIcon = getIconForTab(name);

    return (
        <motion.section
            className="tab-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="tab-header">
                <div className="tab-header-content">
                    <IonIcon icon={tabIcon} className="tab-header-icon" />
                    <div className="tab-header-text">
                        <div className="tab-header-title">
                            <h3>{name}</h3>
                            <IonBadge color="primary">
                                {products.length} produkter
                            </IonBadge>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="tab-products">
                <div className="product-grid">
                    {products.map((productId: number, index: number) => (
                        <ProductCard
                            key={productId}
                            productId={productId}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

// Huvudkomponent för tab-sidan
const TabPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state: { buttonMaps, loading } } = useApi();

    const handleRefresh = (event: CustomEvent) => {
        window.location.reload();
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    if (loading) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="loading-state">
                        <IonSpinner name="crescent" />
                        <p>Laddar produkter...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const buttonMap = buttonMaps.find(map => map.id === parseInt(id));
    
    if (!buttonMap || !buttonMap.id) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="empty-state-container">
                        <IonIcon icon={refreshOutline} className="empty-state-icon" />
                        <IonText>
                            <h2>Kategori hittades inte</h2>
                            <p>Det finns inga produkter att visa just nu.</p>
                        </IonText>
                        <IonButton routerLink="/">
                            Tillbaka till startsidan
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const validProducts = buttonMap.buttons
        .filter(button => button.product)
        .map(button => button.product!);

    return (
        <IonPage>
            <Header />
            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh} className="custom-refresher">
                    <IonRefresherContent
                        pullingIcon={refreshOutline}
                        pullingText="Dra för att uppdatera"
                        refreshingSpinner="crescent"
                        refreshingText="Uppdaterar..."
                    />
                </IonRefresher>

                <div className="container">
                    <AnimatePresence mode="wait">
                        {validProducts.length === 0 ? (
                            <motion.div 
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IonIcon icon={refreshOutline} className="empty-state-icon" />
                                <IonText>
                                    <h2>Inga produkter tillgängliga</h2>
                                    <p>Det finns inga produkter att visa just nu.</p>
                                </IonText>
                            </motion.div>
                        ) : (
                            <TabSection 
                                products={validProducts}
                                name={buttonMap.name}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default TabPage;
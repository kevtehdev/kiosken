import React, { useMemo } from "react";
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
import { useFilters } from "../contexts/filterContext";
import { ProductCard } from "../components/products/ProductCard";
import { Header } from "../components/layout/Header";
import { refreshOutline } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getIconForTab } from '../utils/iconUtils';
import { useStock } from "../hooks/useStock";
import { sortProducts } from "../utils/sortUtils";
import { API } from '@onslip/onslip-360-web-api';
import '../styles/pages/TabPage.css';

interface TabSectionProps {
    products: number[];
    name: string;
}

interface FilteredProductsResult {
    products: number[];
    name: string;
}

type ProductWithDiscount = API.Product & {
    'discount-price'?: number;
}

type ExtendedProduct = ProductWithDiscount;

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

const TabPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state: { buttonMaps, loading, products: apiProducts } } = useApi();
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

    const filteredProducts = useMemo((): FilteredProductsResult => {
        if (!buttonMaps || !id) return { products: [], name: "" };

        // Konvertera ID till number och hitta exakt matchning
        const numericId = parseInt(id);
        const buttonMap = buttonMaps.find(map => map.id === numericId);

        if (!buttonMap || !buttonMap.id) {
            console.log('No matching buttonMap found for id:', numericId);
            return { products: [], name: "" };
        }

        console.log('Found buttonMap:', buttonMap.name, 'for id:', numericId);

        let products = buttonMap.buttons
            .filter(button => button.product !== undefined && button.product !== null)
            .map(button => button.product!);

        // Apply stock filter
        if (filters.hideOutOfStock && stock?.length) {
            products = products.filter((productId) => {
                const stockItem = stock.find(item => item.id === productId);
                return stockItem?.quantity !== undefined && stockItem.quantity > 0;
            });
        }

        // Apply discount filter
        if (filters.onlyShowDiscounts) {
            products = products.filter((productId) => {
                const product = productData[productId] as ExtendedProduct;
                return product && 
                    typeof product['discount-price'] === 'number' && 
                    product['discount-price'] > 0;
            });
        }

        // Apply sorting
        if (filters.sortOrder !== "none" && products.length > 0) {
            products = sortProducts(products, productData, filters.sortOrder);
        }

        return { 
            products, 
            name: buttonMap.name 
        };
    }, [id, buttonMaps, stock, filters, productData]);

    const handleRefresh = (event: CustomEvent) => {
        window.location.reload();
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    if (loading || stockLoading) {
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

    if (!filteredProducts.products.length) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="empty-state-container">
                        <IonIcon icon={refreshOutline} className="empty-state-icon" />
                        <IonText>
                            <h2>Inga produkter tillgängliga</h2>
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
                        <TabSection 
                            products={filteredProducts.products}
                            name={filteredProducts.name}
                        />
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default TabPage;
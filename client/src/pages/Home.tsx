import React, { useMemo } from "react";
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
} from "@ionic/react";
import { refreshOutline, homeOutline, alertCircleOutline } from "ionicons/icons";
import { AnimatePresence } from "framer-motion";
import { useApi } from "../contexts/apiContext";
import { useFilters } from "../contexts/filterContext";
import { Header } from "../components/layout/Header";
import { LoadingState } from "../components/common/LoadingState";
import { EmptyState } from "../components/common/EmptyState";
import { CategorySection } from "../components/products/CategorySection";
import { useStock } from "../hooks/useStock";
import { MESSAGES } from "../constants/messages";
import "../styles/pages/Home.css";

const sortProducts = (products: any[], sortOrder: string) => {
    // TODO: Implementera prissortering när prisdata är tillgänglig
    switch (sortOrder) {
        case 'name-asc':
            return [...products].sort((a, b) => String(a).localeCompare(String(b)));
        case 'name-desc':
            return [...products].sort((a, b) => String(b).localeCompare(String(a)));
        case 'price-asc':
        case 'price-desc':
            console.log('Prissortering kommer implementeras senare');
            return products;
        default:
            return products;
    }
};

const Home: React.FC = () => {
    const {
        state: { buttonMaps, loading: apiLoading },
    } = useApi();
    const { filters } = useFilters();
    const { stock, error, loading: stockLoading } = useStock();

    const filteredCategories = useMemo(() => {
        if (!stock) return [];
        
        let processedCategories = buttonMaps
            .filter(map => map.type === "tablet-buttons" && map.buttons?.length > 0)
            .map(map => ({
                ...map,
                products: map.buttons
                    .filter(button => button.product)
                    .map(button => button.product!)
            }));

        processedCategories = processedCategories.map(category => {
            let filteredProducts = [...category.products];

            // Hantera produkter som är slut
            if (filters.hideOutOfStock) {
                filteredProducts = filteredProducts.filter(product => 
                    stock.some(item => item.id === product && item.quantity! > 0)
                );
            }

            // TODO: Implementera rabattfiltrering när prisdata är tillgänglig
            if (filters.onlyShowDiscounts) {
                console.log('Rabattfiltrering kommer implementeras senare');
            }

            // Sortera produkter
            if (filters.sortOrder !== 'none') {
                filteredProducts = sortProducts(filteredProducts, filters.sortOrder);
            }

            return {
                ...category,
                products: filteredProducts
            };
        });

        return processedCategories;
    }, [stock, filters, buttonMaps]);

    const handleRefresh = (event: CustomEvent) => {
        window.location.reload();
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    if (apiLoading || stockLoading) {
        return <LoadingState message={MESSAGES.LOADING.PRODUCTS} />;
    }

    if (error) {
        return (
            <EmptyState
                icon={alertCircleOutline}
                title="Ett fel uppstod"
                description={error}
            />
        );
    }

    return (
        <IonPage className="home-page">
            <Header />
            <IonContent>
                <IonRefresher
                    slot="fixed"
                    onIonRefresh={handleRefresh}
                    className="custom-refresher"
                >
                    <IonRefresherContent
                        pullingIcon={refreshOutline}
                        pullingText={MESSAGES.ACTIONS.REFRESH}
                        refreshingSpinner="crescent"
                        refreshingText={MESSAGES.ACTIONS.UPDATING}
                    />
                </IonRefresher>
                <div className="container">
                    <AnimatePresence mode="sync">
                        {filteredCategories.length === 0 ? (
                            <EmptyState
                                icon={homeOutline}
                                title={MESSAGES.EMPTY_STATES.PRODUCTS.TITLE}
                                description={MESSAGES.EMPTY_STATES.PRODUCTS.DESCRIPTION}
                            />
                        ) : (
                            <>
                                {filteredCategories.map((category, index) => (
                                    category.products.length > 0 && (
                                        <CategorySection
                                            key={category.id}
                                            category={category}
                                            products={category.products}
                                            index={index}
                                        />
                                    )
                                ))}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Home;
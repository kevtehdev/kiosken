import React, { useState, useMemo } from "react";
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonToggle,
} from "@ionic/react";
import { refreshOutline, homeOutline, alertCircleOutline } from "ionicons/icons";
import { AnimatePresence } from "framer-motion";
import { useApi } from "../contexts/apiContext";
import { Header } from "../components/layout/Header";
import { LoadingState } from "../components/common/LoadingState";
import { EmptyState } from "../components/common/EmptyState";
import { CategorySection } from "../components/products/CategorySection";
import { useStock } from "../hooks/useStock";
import { MESSAGES } from "../constants/messages";
import "../styles/pages/Home.css";

const Home: React.FC = () => {
    const {
        state: { buttonMaps, loading: apiLoading },
    } = useApi();
    const [filterOutOfStock, setFilterOutOfStock] = useState(true);
    const { stock, error, loading: stockLoading } = useStock();

    const filteredCategories = useMemo(() => {
        if (!stock) return [];
        
        return buttonMaps
            .filter(map => map.type === "tablet-buttons" && map.buttons?.length > 0)
            .map(map => ({
                ...map,
                products: map.buttons
                    .filter(button => button.product)
                    .map(button => button.product!)
            }))
            .map(category => ({
                ...category,
                products: filterOutOfStock
                    ? category.products.filter(product => 
                        stock.some(item => item.id === product && item.quantity! > 0))
                    : category.products
            }));
    }, [stock, filterOutOfStock, buttonMaps]);

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
                                <div className="toggle-container">
                                    <IonToggle
                                        onClick={() => setFilterOutOfStock(!filterOutOfStock)}
                                        checked={filterOutOfStock}
                                    >
                                        {MESSAGES.ACTIONS.HIDE_OUT_OF_STOCK}
                                    </IonToggle>
                                </div>
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
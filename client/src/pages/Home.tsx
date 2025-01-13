import React, { useMemo } from "react";
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
} from "@ionic/react";
import {
    refreshOutline,
    homeOutline,
    alertCircleOutline,
} from "ionicons/icons";
import { AnimatePresence } from "framer-motion";
import { useApi } from "../contexts/apiContext";
import { useFilters } from "../contexts/filterContext";
import { Header } from "../components/layout/Header";
import { LoadingState } from "../components/common/LoadingState";
import { EmptyState } from "../components/common/EmptyState";
import { CategorySection } from "../components/products/CategorySection";
import { useStock } from "../hooks/useStock";
import { MESSAGES } from "../constants/messages";
import { API } from '@onslip/onslip-360-web-api';
import { Category } from "../types";
import { sortProducts } from "../utils/sortUtils";
import "../styles/pages/Home.css";

type ProductWithDiscount = API.Product & {
    'discount-price'?: number;
}

type ExtendedProduct = ProductWithDiscount;

const processButtonMap = (map: API.ButtonMap): Category => ({
    id: map.id ?? undefined,
    name: map.name || "",
    type: (map.type as Category["type"]) || "tablet-buttons",
    buttons: map.buttons || [],
    products: (map.buttons || [])
        .filter(
            (button): button is API.ButtonMapItem & { product: number } =>
                typeof button.product === "number"
        )
        .map((button) => button.product),
});

const Home: React.FC = () => {
    const {
        state: { buttonMaps, loading: apiLoading, products: apiProducts },
    } = useApi();
    const { filters } = useFilters();
    const { stock, error, loading: stockLoading } = useStock();

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

    const filteredCategories = useMemo(() => {
        if (!buttonMaps?.length) {
            return [];
        }

        return buttonMaps
            .filter((map) => map.type === "tablet-buttons" && map.buttons?.length > 0)
            .map((map) => {
                const category = processButtonMap(map);
                let filteredProducts = [...category.products];

                if (filters.hideOutOfStock && stock?.length) {
                    filteredProducts = filteredProducts.filter((productId) => {
                        const stockItem = stock.find(item => item.id === productId);
                        return stockItem?.quantity !== undefined && stockItem.quantity > 0;
                    });
                }

                if (filters.onlyShowDiscounts) {
                    filteredProducts = filteredProducts.filter((productId) => {
                        const product = productData[productId] as ExtendedProduct;
                        return product && 
                            typeof product['discount-price'] === 'number' && 
                            product['discount-price'] > 0;
                    });
                }

                let sortedProducts = filteredProducts;
                if (filters.sortOrder !== "none" && filteredProducts.length > 0) {
                    sortedProducts = sortProducts(
                        filteredProducts,
                        productData,
                        filters.sortOrder
                    );
                }

                return {
                    ...category,
                    products: sortedProducts,
                };
            })
            .filter((category) => category.products.length > 0);
    }, [buttonMaps, stock, filters, productData]);

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
                                description={
                                    MESSAGES.EMPTY_STATES.PRODUCTS.DESCRIPTION
                                }
                            />
                        ) : (
                            <>
                                {filteredCategories.map((category, index) => (
                                    <CategorySection
                                        key={category.id || index}
                                        category={category}
                                        products={category.products}
                                        index={index}
                                    />
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
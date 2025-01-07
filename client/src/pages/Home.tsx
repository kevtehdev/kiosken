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
import { Category, Product } from "../types";
import "../styles/pages/Home.css";

// Konverterar en ButtonMap från API:et till vår interna Category-struktur
const processButtonMap = (map: API.ButtonMap): Category => {
    return {
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
    };
};

// Hanterar sortering av produkter baserat på olika kriterier
const sortProducts = (
    products: number[],
    productData: Record<number, API.Product>,
    sortOrder: string
): number[] => {
    switch (sortOrder) {
        case "name-asc":
            return [...products].sort((a, b) =>
                (productData[a]?.name || "").localeCompare(
                    productData[b]?.name || ""
                )
            );
        case "name-desc":
            return [...products].sort((a, b) =>
                (productData[b]?.name || "").localeCompare(
                    productData[a]?.name || ""
                )
            );
        case "price-asc":
            return [...products].sort(
                (a, b) =>
                    (productData[a]?.price || 0) - (productData[b]?.price || 0)
            );
        case "price-desc":
            return [...products].sort(
                (a, b) =>
                    (productData[b]?.price || 0) - (productData[a]?.price || 0)
            );
        default:
            return products;
    }
};

// Huvudkomponent för hemsidan
const Home: React.FC = () => {
    const {
        state: { buttonMaps, loading: apiLoading, products },
    } = useApi();
    const { filters } = useFilters();
    const { stock, error, loading: stockLoading } = useStock();

    // Skapar en effektiv lookup-struktur för produktdata
    const productData = useMemo(() => {
        if (!products || !Array.isArray(products))
            return {} as Record<number, API.Product>;

        return products.reduce<Record<number, API.Product>>(
            (acc: Record<number, API.Product>, product: API.Product) => {
                if (product.id !== undefined) {
                    acc[product.id] = product;
                }
                return acc;
            },
            {}
        );
    }, [products]);

    // Filtrerar och bearbetar kategorier baserat på aktuella filter
    const filteredCategories = useMemo(() => {
        if (!stock || !buttonMaps) return [];

        return buttonMaps
            .filter(
                (map) =>
                    map.type === "tablet-buttons" && map.buttons?.length > 0
            )
            .map((map) => {
                const category = processButtonMap(map);
                let filteredProducts = [...category.products];

                if (filters.hideOutOfStock) {
                    filteredProducts = filteredProducts.filter((productId) =>
                        stock.some(
                            (item) =>
                                item.id === productId &&
                                item.quantity !== undefined &&
                                item.quantity > 0
                        )
                    );
                }

                if (filters.onlyShowDiscounts) {
                    filteredProducts = filteredProducts.filter((productId) => {
                        const product = productData[productId];
                        return (
                            product &&
                            "discount-price" in product &&
                            product["discount-price"] !== undefined
                        );
                    });
                }

                if (filters.sortOrder !== "none") {
                    filteredProducts = sortProducts(
                        filteredProducts,
                        productData,
                        filters.sortOrder
                    );
                }

                return {
                    ...category,
                    products: filteredProducts,
                };
            })
            .filter((category) => category.products.length > 0);
    }, [buttonMaps, stock, filters, productData]);

    // Hanterar siduppdatering
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
                                        key={category.id}
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

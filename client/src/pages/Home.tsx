import React, { useEffect, useState } from "react";
import {
    IonContent,
    IonPage,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonBadge,
    IonToggle,
} from "@ionic/react";
import { refreshOutline, homeOutline } from "ionicons/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../contexts/apiContext";
import { ProductCard } from "../components/products/ProductCard";
import { Header } from "../components/layout/Header";
import { getIconForTab } from "../components/layout/TabBar";
import "../styles/pages/Home.css";
import { API } from "@onslip/onslip-360-web-api";
import { api } from "../services/api";

interface Category {
    products: number[];
    id?: number | undefined;
    name: string;
    type:
        | "menu"
        | "tablet-groups"
        | "tablet-buttons"
        | "phone-buttons"
        | "menu-section";
    buttons: API.ButtonMapItem[];
}

interface CategorySectionProps {
    category: Category;
    products: number[];
    index: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({
    category,
    products,
    index,
}) => {
    const categoryIcon = getIconForTab(category.name);

    return (
        <motion.section
            className="category-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <div className="category-header">
                <div className="category-header-content">
                    <IonIcon
                        icon={categoryIcon}
                        className="category-header-icon"
                    />
                    <div className="category-header-text">
                        <div className="category-header-title">
                            <h3>{category.name}</h3>
                            <IonBadge color="primary">
                                {products.length} produkter
                            </IonBadge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="category-products">
                <div className="product-grid">
                    {products.map((productId, productIndex) => (
                        <ProductCard
                            key={productId}
                            productId={productId}
                            index={productIndex}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

const Home: React.FC = () => {
    const {
        state: { buttonMaps, loading },
    } = useApi();
    const [filterOutOfStock, setFilterOutOfStock] = useState(true);
    const [stock, setStock] = useState<API.StockBalance[]>();
    const [categories, setCategories] = useState<
        {
            products: number[];
            id?: number | undefined;
            name: string;
            type:
                | "menu"
                | "tablet-groups"
                | "tablet-buttons"
                | "phone-buttons"
                | "menu-section";
            buttons: API.ButtonMapItem[];
        }[]
    >([]);

    useEffect(() => {
        async function fetch() {
            try {
                const stockData = await api.listStockBalance(1);
                setStock(stockData);
            } catch (error) {
                console.log(error);
            }
        }
        fetch();
    }, []);

    useEffect(() => {
        if (stock) {
            const filteredCategories = buttonMaps
                .filter(
                    (map) =>
                        map.type === "tablet-buttons" &&
                        map.buttons &&
                        map.buttons.length > 0
                )
                .map((map) => ({
                    ...map,
                    products: map.buttons
                        .filter((button) => button.product)
                        .map((button) => button.product!),
                }))
                .map((category) => ({
                    ...category,
                    products: filterOutOfStock
                        ? category.products.filter((product) =>
                              stock.some(
                                  (item) =>
                                      item.id === product && item.quantity! > 0
                              )
                          )
                        : category.products,
                }));
            setCategories(filteredCategories);
        }
    }, [stock, filterOutOfStock, buttonMaps]);

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

    return (
        <IonPage>
            <Header />
            <IonContent>
                <IonRefresher
                    slot="fixed"
                    onIonRefresh={handleRefresh}
                    className="custom-refresher"
                >
                    <IonRefresherContent
                        pullingIcon={refreshOutline}
                        pullingText="Dra för att uppdatera"
                        refreshingSpinner="crescent"
                        refreshingText="Uppdaterar..."
                    />
                </IonRefresher>
                <div className="container">
                    <AnimatePresence mode="sync">
                        {categories.length === 0 ? (
                            <motion.div
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IonIcon
                                    icon={homeOutline}
                                    className="empty-state-icon"
                                />
                                <IonText>
                                    <h2>Inga produkter tillgängliga</h2>
                                    <p>
                                        Det finns inga produkter att visa just
                                        nu.
                                    </p>
                                </IonText>
                            </motion.div>
                        ) : (
                            <>
                                <IonToggle
                                    onClick={() =>
                                        setFilterOutOfStock(!filterOutOfStock)
                                    }
                                    checked={filterOutOfStock}
                                >
                                    Göm Slut
                                </IonToggle>
                                {categories?.map((category, index) => {
                                    if (category.products.length > 0) {
                                        return (
                                            <CategorySection
                                                key={category.id}
                                                category={category}
                                                products={category.products}
                                                index={index}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Home;

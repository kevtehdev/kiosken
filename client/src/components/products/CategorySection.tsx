import React, { memo } from 'react';
import { IonIcon, IonBadge } from "@ionic/react";
import { motion } from "framer-motion";
import { getIconForTab } from "../../utils/iconUtils";
import { ProductCard } from "./ProductCard";
import { Category } from '../../types';

interface CategorySectionProps {
    category: Category;
    products: number[];
    index: number;
}

export const CategorySection = memo<CategorySectionProps>(({
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
                        aria-hidden="true"
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
});

CategorySection.displayName = 'CategorySection';
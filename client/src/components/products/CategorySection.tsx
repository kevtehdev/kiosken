import React, { memo, useMemo } from 'react';
import { IonIcon, IonBadge, IonRippleEffect } from "@ionic/react";
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
    const categoryIcon = useMemo(() => getIconForTab(category.name), [category.name]);
    
    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const productVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.section
            className="category-section"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            role="region"
            aria-label={`${category.name} kategori`}
        >
            <header className="category-header">
                <div className="category-header-content">
                    <div className="category-header-icon-wrapper">
                        <IonIcon
                            icon={categoryIcon}
                            className="category-header-icon"
                            aria-hidden="true"
                        />
                        <IonRippleEffect />
                    </div>
                    
                    <div className="category-header-text">
                        <div className="category-header-title">
                            <h2>{category.name}</h2>
                            <IonBadge 
                                color="primary"
                                className="category-badge"
                            >
                                {products.length} {products.length === 1 ? 'produkt' : 'produkter'}
                            </IonBadge>
                        </div>
                    </div>
                </div>
            </header>

            <div className="category-products">
                <motion.div 
                    className="product-grid"
                    variants={productVariants}
                >
                    {products.map((productId, productIndex) => (
                        <ProductCard
                            key={productId}
                            productId={productId}
                            index={productIndex}
                        />
                    ))}
                </motion.div>
            </div>
        </motion.section>
    );
});

CategorySection.displayName = 'CategorySection';
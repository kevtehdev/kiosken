import React from 'react';
import { motion } from "framer-motion";
import { Campaign, Product } from '../../types';
import { CampaignBanner } from './CampaignBanner';
import { ProductCard } from '../products/ProductCard';

interface CampaignSectionProps {
    campaign: Campaign;
    products: Product[];
    index: number;
}

export const CampaignSection: React.FC<CampaignSectionProps> = ({ 
    campaign, 
    products, 
    index 
}) => {
    const allCampaignProducts = campaign.rules.flatMap((rule) => rule.products);
    const validProducts = allCampaignProducts
        .map((productId) => products.find((p) => p.id === productId))
        .filter((product): product is Product => 
            product !== undefined && 
            typeof product.id === 'number' && 
            !isNaN(product.id)
        );

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
                    {validProducts.map((product, productIndex) => {
                        if (typeof product.id !== 'number') return null;
                        return (
                            <ProductCard
                                key={product.id}
                                productId={product.id}
                                index={productIndex}
                            />
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
};

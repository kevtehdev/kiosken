import React, { useCallback, useEffect, useState } from 'react';
import {
    IonCard,
    IonCardContent,
    IonButton,
    IonSkeletonText,
    IonText,
    IonBadge,
    IonIcon,
    IonRippleEffect,
    IonImg,
} from '@ionic/react';
import {
    cartOutline,
    checkmarkCircleOutline,
    alertCircleOutline,
} from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../contexts/apiContext';
import { useCart } from '../../contexts/cartContext';
import { API } from '@onslip/onslip-360-web-api';
import { api } from '../../services/api';
import "../../styles/components/products/ProductCard.css";

interface ProductCardProps {
    productId: number;
    index?: number;
}

interface CampaignState {
    display: string | number | null;
    data: API.Campaign | null;
    reducedPrice: number | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    productId,
    index = 0,
}) => {
    const { state: { products, loading } } = useApi();
    const product = products[productId];
    const { dispatch } = useCart();
    
    const [campaign, setCampaign] = useState<CampaignState>({
        display: null,
        data: null,
        reducedPrice: null
    });
    const [isAdded, setIsAdded] = useState(false);
    const [stockQuantity, setStockQuantity] = useState<number>(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchProductData = async () => {
            if (!product?.price || !product?.id) return;

            try {
                // Fetch stock information
                const stock = await api.listStockBalance(1, `id:${product.id}`);
                if (!isMounted) return;
                setStockQuantity(stock[0]?.quantity || 0);

                // Fetch campaign information
                const bestCampaign = await api.findBestCampaign(product.id);
                if (!isMounted || !bestCampaign) return;

                const campaignState = calculateCampaignDetails(bestCampaign, product.price);
                setCampaign(campaignState);
            } catch (error) {
                console.error('Fel vid hämtning av produktdata:', error);
            }
        };

        fetchProductData();
        return () => { isMounted = false; };
    }, [product]);

    const calculateCampaignDetails = (
        campaignData: API.Campaign, 
        productPrice: number
    ): CampaignState => {
        const state: CampaignState = {
            display: null,
            data: campaignData,
            reducedPrice: null
        };

        state.display = campaignData['discount-rate'] || 
                       campaignData.amount || 
                       campaignData.name;

        const hasComplexRules = campaignData.rules?.[0]?.quantity > 1 || 
                               campaignData.rules?.length > 1;

        switch (campaignData.type) {
            case 'fixed-amount':
                if (campaignData.amount) {
                    state.reducedPrice = productPrice - campaignData.amount;
                }
                break;
            case 'fixed-price':
                if (hasComplexRules) {
                    state.display = campaignData.name;
                } else {
                    state.reducedPrice = campaignData.amount || null;
                }
                break;
            case 'percentage':
                if (hasComplexRules) {
                    state.display = campaignData.name;
                } else if (campaignData['discount-rate']) {
                    state.reducedPrice = productPrice * (1 - campaignData['discount-rate'] / 100);
                }
                break;
        }

        return state;
    };

    const handleAddToCart = useCallback(() => {
        if (isAdded || !product?.id || stockQuantity <= 0) return;

        dispatch({
            type: 'ADD_ITEM',
            payload: {
                'product-name': product.name,
                product: product.id,
                quantity: 1,
                price: product.price,
                type: 'goods',
                'product-group': product['product-group'],
            },
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    }, [dispatch, product, isAdded, stockQuantity]);

    if (loading || !product) {
        return (
            <IonCard className="product-card">
                <div className="skeleton-container">
                    <IonSkeletonText animated className="skeleton-image" />
                    <IonSkeletonText animated className="skeleton-title" />
                    <IonSkeletonText animated className="skeleton-price" />
                    <IonSkeletonText animated className="skeleton-button" />
                </div>
            </IonCard>
        );
    }

    const getButtonColor = () => {
        if (isAdded) return 'success';
        if (stockQuantity <= 0) return 'medium';
        return 'dark';
    };

    const getButtonIcon = () => {
        if (isAdded) return checkmarkCircleOutline;
        if (stockQuantity <= 0) return alertCircleOutline;
        return cartOutline;
    };

    const getButtonText = () => {
        if (loading) return 'Laddar...';
        if (!product.price) return 'Ej tillgänglig';
        if (isAdded) return 'Tillagd i kundvagn';
        if (stockQuantity <= 0) return 'Tillfälligt slut';
        return 'Lägg till i kundvagn';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <IonCard className="product-card">
                <div className="image-container">
                    <IonImg
                        src={product.description}
                        alt={product.name}
                        className={`product-image ${imageLoaded ? 'fade-in' : ''}`}
                        onIonImgDidLoad={() => setImageLoaded(true)}
                    />
                    
                    {product.price && (
                        <motion.div
                            className="price-badge"
                            animate={{ scale: isAdded ? 1.05 : 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <IonText>
                                {campaign.reducedPrice ? (
                                    <>
                                        <span className="old-price">
                                            {product.price.toFixed(2)} kr
                                        </span>
                                        <h3 className="current-price reduced-price">
                                            {campaign.reducedPrice.toFixed(2)} kr
                                        </h3>
                                    </>
                                ) : (
                                    <h3 className="current-price">
                                        {product.price.toFixed(2)} kr
                                    </h3>
                                )}
                            </IonText>
                        </motion.div>
                    )}
                </div>

                <AnimatePresence>
                    {campaign.data?.type && campaign.display && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="discount-badge"
                        >
                            {typeof campaign.display === 'string'
                                ? campaign.display
                                : campaign.data?.type === 'percentage'
                                ? `-${campaign.display}%`
                                : campaign.data?.type === 'fixed-amount'
                                ? `-${campaign.display}kr`
                                : campaign.display}
                        </motion.div>
                    )}
                </AnimatePresence>

                <IonCardContent className="product-content">
                    <h3 className="product-title">{product.name}</h3>
                    
                    <div className="stock-info">
                        {stockQuantity > 0 ? (
                            <span className="in-stock">
                                I lager: {stockQuantity}st
                            </span>
                        ) : (
                            <span className="out-of-stock">
                                Tillfälligt slut
                            </span>
                        )}
                    </div>

                    {product.unit && (
                        <IonBadge className="unit-badge">
                            per {product.unit}
                        </IonBadge>
                    )}

                    <IonButton
                        className="cart-button"
                        expand="block"
                        disabled={loading || !product.price || isAdded || stockQuantity <= 0}
                        onClick={handleAddToCart}
                        color={getButtonColor()}
                    >
                        <IonIcon
                            icon={getButtonIcon()}
                            slot="start"
                            aria-hidden="true"
                        />
                        {getButtonText()}
                        <IonRippleEffect />
                    </IonButton>
                </IonCardContent>
            </IonCard>
        </motion.div>
    );
};

export default ProductCard;
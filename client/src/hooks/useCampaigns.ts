import { useState, useEffect } from 'react';
import { Campaign, Product } from '../types';
import { api } from '../services/api';

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const [campaignsRes, productsRes] = await Promise.all([
                    api.getCampaigns(),
                    api.getProducts()
                ]);
                setCampaigns(campaignsRes);
                setProducts(Object.values(productsRes.products));
                setError(null);
            } catch (error) {
                setError('Kunde inte hämta kampanjer');
                console.error('Failed to fetch campaigns:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    return { campaigns, products, loading, error };
};
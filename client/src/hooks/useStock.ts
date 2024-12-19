import { useState, useEffect } from 'react';
import { API } from "@onslip/onslip-360-web-api";
import { api } from "../services/api";

export const useStock = () => {
    const [stock, setStock] = useState<API.StockBalance[]>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const stockData = await api.listStockBalance(1);
                setStock(stockData);
                setError(null);
            } catch (error) {
                setError('Kunde inte hämta lagerdata');
                console.error('Failed to fetch stock:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, []);

    return { stock, error, loading };
};

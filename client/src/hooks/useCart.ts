import { useState, useEffect } from 'react';
import { useCart as useCartContext } from '../contexts/cartContext';
import { api } from '../services/api';

export const useCart = () => {
    const { state, dispatch } = useCartContext();
    const [total, setTotal] = useState<number>(0);
    const [totalDiscount, setTotalDiscount] = useState<number>(0);

    useEffect(() => {
        const calculateTotal = async () => {
            if (state.items.length > 0) {
                const total = await api.calcDiscountedTotal(state.items);
                const totalWithoutDiscount = state.items.reduce(
                    (sum, item) => sum + (item.price || 0) * item.quantity,
                    0
                );
                setTotal(total);
                setTotalDiscount(totalWithoutDiscount - total);
            } else {
                setTotal(0);
                setTotalDiscount(0);
            }
        };

        calculateTotal();
    }, [state.items]);

    return {
        items: state.items,
        total,
        totalDiscount,
        dispatch
    };
};
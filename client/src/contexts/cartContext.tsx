import React, {
    createContext,
    useContext,
    useReducer,
    ReactNode,
    useEffect,
} from "react";
import { API } from "@onslip/onslip-360-web-api";

interface CartState {
    items: API.Item[];
}

type CartAction =
    | { type: "ADD_ITEM"; payload: API.Item }
    | { type: "REMOVE_ITEM"; payload: number }
    | { type: "UPDATE_QUANTITY"; payload: { product: number; quantity: number } }
    | { type: "CLEAR_CART" };

const initialState: CartState = {
    items: [],
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case "ADD_ITEM": {
            const existingItemIndex = state.items.findIndex(
                (item) => item.product === action.payload.product
            );
            
            if (existingItemIndex !== -1) {
                return {
                    items: state.items.map((item, index) => 
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            }
            
            return { 
                items: [...state.items, { ...action.payload, quantity: 1 }] 
            };
        }
        case "REMOVE_ITEM":
            return {
                items: state.items.filter(
                    (item) => item.product !== action.payload
                ),
            };
        case "UPDATE_QUANTITY":
            return {
                items: state.items.map((item) =>
                    item.product === action.payload.product
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        case "CLEAR_CART":
            return initialState;
        default:
            return state;
    }
};

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
}>({ state: initialState, dispatch: () => undefined });

export const CartProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(cartReducer, initialState, () => {
        try {
            const localData = localStorage.getItem("cart");
            return localData ? JSON.parse(localData) : initialState;
        } catch {
            return initialState;
        }
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(state));
    }, [state]);

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

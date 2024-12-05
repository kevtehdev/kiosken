import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { api } from "../services/api";

interface ButtonMapItem {
    name?: string;
    product?: number;
    'button-map'?: number;
}

export interface ButtonMap {
    id?: number;
    name: string;
    type: string;
    buttons: ButtonMapItem[];
}

interface Product {
    id?: number;
    name: string;
    price?: number;
    'product-group': number;
}

interface ApiState {
    buttonMaps: ButtonMap[];
    products: { [key: number]: Product };
    loading: boolean;
    error: Error | null;
}

type ApiAction = 
    | { type: "FETCH_SUCCESS"; payload: { buttonMaps: ButtonMap[]; products: { [key: number]: Product } }}
    | { type: "FETCH_ERROR"; payload: Error };

const initialState: ApiState = {
    buttonMaps: [],
    products: {},
    loading: true,
    error: null,
};

const apiReducer = (state: ApiState, action: ApiAction): ApiState => {
    switch (action.type) {
        case "FETCH_SUCCESS":
            return {
                buttonMaps: action.payload.buttonMaps,
                products: action.payload.products,
                loading: false,
                error: null
            };
        case "FETCH_ERROR":
            return {
                ...initialState,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};

const ApiContext = createContext<{
    state: ApiState;
    dispatch: React.Dispatch<ApiAction>;
} | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(apiReducer, initialState);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.getProducts();
                dispatch({ 
                    type: "FETCH_SUCCESS", 
                    payload: data
                });
            } catch (err) {
                dispatch({ 
                    type: "FETCH_ERROR", 
                    payload: err instanceof Error ? err : new Error("Ett fel uppstod") 
                });
            }
        };

        loadData();
    }, []);

    return (
        <ApiContext.Provider value={{ state, dispatch }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error("useApi måste användas inom en ApiProvider");
    }
    return context;
};
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { api } from '../services/api';

export interface Customer {
    id: number;
    name: string;
    email?: string;
    role?: string;
}

interface CustomerState {
    customers: Customer[];
    loading: boolean;
    error: Error | null;
}

type CustomerAction =
    | { type: "SET_CUSTOMERS"; payload: Customer[] }
    | { type: "SET_ERROR"; payload: Error }
    | { type: "SET_LOADING"; payload: boolean };

const initialState: CustomerState = {
    customers: [],
    loading: true,
    error: null,
};

const customerReducer = (state: CustomerState, action: CustomerAction): CustomerState => {
    switch (action.type) {
        case "SET_CUSTOMERS":
            return { ...state, customers: action.payload, loading: false };
        case "SET_ERROR":
            return { ...state, error: action.payload, loading: false };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

const CustomerContext = createContext<{
    state: CustomerState;
    dispatch: React.Dispatch<CustomerAction>;
}>({ state: initialState, dispatch: () => undefined });

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(customerReducer, initialState);

    useEffect(() => {
        const loadCustomers = async () => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const customers = await api.getCustomers();
                dispatch({ type: "SET_CUSTOMERS", payload: customers });
            } catch (error) {
                dispatch({
                    type: "SET_ERROR",
                    payload: error instanceof Error ? error : new Error('Fel vid hämtning av användare'),
                });
            }
        };

        loadCustomers();
    }, []);

    return (
        <CustomerContext.Provider value={{ state, dispatch }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error("useCustomer måste användas inom en CustomerProvider");
    }
    return context;
};
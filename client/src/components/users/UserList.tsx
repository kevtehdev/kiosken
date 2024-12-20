import React, { useState, useEffect } from "react";
import { IonSelect, IonSelectOption, IonSpinner } from "@ionic/react";
import { useCustomer, Customer } from "../../contexts/userContext";
import '../../styles/components/cart/UserList.css';

interface UserListProps {
    onCustomerSelect: (customer: Customer) => void;
}

export const UserList: React.FC<UserListProps> = ({ onCustomerSelect }) => {
    const { state: { customers, loading, error } } = useCustomer();
    const [selectInterface, setSelectInterface] = useState<"action-sheet" | "popover">("popover");

    useEffect(() => {
        const handleResize = () => {
            setSelectInterface(window.innerWidth < 768 ? "action-sheet" : "popover");
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loading) {
        return (
            <div className="customer-status">
                <IonSpinner name="crescent" />
                <span>Laddar användare...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="customer-status error">
                <p>Fel vid hämtning av användare: {error.message}</p>
            </div>
        );
    }

    if (!customers || customers.length === 0) {
        return (
            <div className="customer-status empty">
                <p>Inga användare tillgängliga.</p>
            </div>
        );
    }

    const sortedCustomers = [...customers].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
    );

    return (
        <div className="customer-select-container">
            <IonSelect
                interface={selectInterface}
                placeholder="Välj anställd..."
                onIonChange={(e) => {
                    const selectedCustomer = customers.find(
                        customer => customer.id === e.detail.value
                    );
                    if (selectedCustomer) {
                        onCustomerSelect(selectedCustomer);
                    }
                }}
                className="modern-select"
                toggleIcon="caret-down-outline"
            >
                {sortedCustomers.map((customer) => (
                    <IonSelectOption 
                        key={customer.id} 
                        value={customer.id}
                    >
                        {customer.name}
                        {customer.email && ` (${customer.email})`}
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};
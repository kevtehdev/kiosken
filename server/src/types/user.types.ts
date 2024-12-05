import { OnslipCustomer } from './onslip.types';

export type SystemRole = 'admin' | 'cashier' | 'service' | 'employee';

export interface CustomerContextType {
    customer: OnslipCustomer[];
    loading: boolean;
    error: Error | null;
}
import api from './api';
import type { Customer } from '../types'; // Check if types has Customer

export interface CustomerInput {
    storeId: string;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
}

export const customerApi = {
    list: async (storeId: string) => {
        const response = await api.get(`/customers/store/${storeId}`);
        return {
            success: true,
            customers: response.data
        };
    },

    create: async (storeId: string, data: Omit<CustomerInput, 'storeId'>) => {
        const response = await api.post(`/customers/store/${storeId}`, data);
        return {
            success: true,
            customer: response.data
        };
    },

    update: async (id: string, data: Partial<CustomerInput>) => {
        const response = await api.put(`/customers/${id}`, data);
        return {
            success: true,
            customer: response.data
        };
    },

    delete: async (id: string) => {
        await api.delete(`/customers/${id}`);
        return {
            success: true
        };
    }
};

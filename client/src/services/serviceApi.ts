import api from './api';
import type { Service } from '../context/AuthContext';

export interface CreateServiceData {
    storeId: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
    currency?: string;
}

export const serviceApi = {
    // List services
    list: async (storeId: string): Promise<{ success: boolean; services: Service[] }> => {
        const response = await api.get(`/services/store/${storeId}`);
        return response.data;
    },

    // Create service
    create: async (data: CreateServiceData): Promise<{ success: boolean; service: Service }> => {
        const response = await api.post('/services', data);
        return response.data;
    },

    // Update service
    update: async (id: number | string, data: Partial<Service>): Promise<{ success: boolean; service: Service }> => {
        const response = await api.put(`/services/${id}`, data);
        return response.data;
    },

    // Delete service
    delete: async (id: number | string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    }
};

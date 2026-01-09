import api from './api';
import type { UserStore, WorkingHour } from '../context/AuthContext';

export interface StoreUpdateData {
    name?: string;
    slug?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    instagram?: string;
    whatsapp?: string;
    facebook?: string;
}

// Helper function to normalize store object from MongoDB (_id -> id)
const normalizeStore = (store: any): UserStore => {
    if (!store) return store;
    return {
        ...store,
        id: store.id || store._id,
    };
};

export const storeApi = {
    // Get store by ID
    getById: async (id: string): Promise<{ success: boolean; store: UserStore }> => {
        const response = await api.get(`/stores/${id}`);
        const data = response.data;
        return {
            ...data,
            store: normalizeStore(data.store)
        };
    },

    // Get store by Slug
    getBySlug: async (slug: string): Promise<{ success: boolean; store: UserStore }> => {
        const response = await api.get(`/stores/slug/${slug}`);
        const data = response.data;
        return {
            ...data,
            store: normalizeStore(data.store)
        };
    },

    // Update Customization
    updateCustomization: async (storeId: string, customization: any): Promise<{ success: boolean; store: UserStore }> => {
        const response = await api.put(`/stores/${storeId}/customization`, { customization });
        const data = response.data;
        return {
            ...data,
            store: normalizeStore(data.store)
        };
    },

    // Update Working Hours
    updateWorkingHours: async (storeId: string, workingHours: WorkingHour[]): Promise<{ success: boolean; store: UserStore }> => {
        const response = await api.put(`/stores/${storeId}/working-hours`, { workingHours });
        const data = response.data;
        return {
            ...data,
            store: normalizeStore(data.store)
        };
    },

    // Update Settings
    updateSettings: async (storeId: string, data: StoreUpdateData): Promise<{ success: boolean; store: UserStore }> => {
        const response = await api.put(`/stores/${storeId}/settings`, data);
        const respData = response.data;
        return {
            ...respData,
            store: normalizeStore(respData.store)
        };
    },

    // Update Weekly Time Slots
    updateWeeklySlots: async (storeId: string, weeklyTimeSlots: Record<number, string[]>): Promise<{ success: boolean; store: UserStore }> => {
        const response = await api.put(`/stores/${storeId}/weekly-slots`, { weeklyTimeSlots });
        const respData = response.data;
        return {
            ...respData,
            store: normalizeStore(respData.store)
        };
    },

    // Update Store Status
    updateStatus: async (storeId: string, status: 'active' | 'suspended'): Promise<{ success: boolean; store: UserStore }> => {
        const response = await api.patch(`/stores/${storeId}/status`, { status });
        const data = response.data;
        return {
            ...data,
            store: normalizeStore(data.store)
        };
    },

    // Delete Store
    deleteStore: async (storeId: string): Promise<{ success: boolean }> => {
        const response = await api.delete(`/stores/${storeId}`);
        return response.data;
    }
};

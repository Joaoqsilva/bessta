// Admin Master Data Service
// Centralizes all platform data for the master admin using API

import { platformManagementApi } from '../services/platformApi';
// import type { RegisteredStore } from '../types'; 

export interface RegisteredStore {
    id: string;
    slug: string;
    name: string;
    category: string;
    ownerName: string;
    ownerEmail: string;
    phone: string;
    address: string;
    status: 'active' | 'pending' | 'suspended';
    plan: 'free' | 'basic' | 'pro';
    rating: number;
    totalReviews: number;
    totalCustomers: number;
    totalAppointments: number;
    totalRevenue: number;
    createdAt: string;
}

export interface PlatformStats {
    totalStores: number;
    activeStores: number;
    activeStoresThisMonth: number;
    pendingStores: number;
    totalUsers: number;
    activeUsers: number;
    totalAppointments: number;
    appointmentsToday: number;
    totalRevenue: string; // Formatted string
    revenueThisMonth: number;
    openComplaints: number;
    pendingSupport: number;
    openSupportTickets: number;
    averagePlatformRating: number;
    planDistribution?: {
        free: number;
        basic: number;
        pro: number;
    };
    monthlyData?: {
        month: string;
        appointments: number;
        revenue: number;
        newStores: number;
    }[];
}

// Get all registered stores from API
export const getAllRegisteredStores = async (): Promise<RegisteredStore[]> => {
    try {
        const result = await platformManagementApi.getStores();
        if (result.success) {
            return result.stores.map((store: any) => ({
                id: String(store._id || store.id),
                slug: store.slug,
                name: store.name,
                category: store.category || 'Serviços',
                ownerName: store.ownerName,
                ownerEmail: store.email,
                phone: store.phone,
                address: store.address || '',
                status: store.status || 'active',
                plan: store.plan || 'free',
                rating: store.rating || 0,
                totalReviews: store.totalReviews || 0,
                totalCustomers: store.totalCustomers || 0, // Backend needs to provide this or we fetch separately? Backend provides simpler stats for now.
                totalAppointments: store.totalAppointments || 0,
                totalRevenue: store.totalRevenue || 0,
                createdAt: store.createdAt,
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching stores:', error);
        return [];
    }
};

// Calculate platform statistics
export const getPlatformStats = async (): Promise<PlatformStats> => {
    try {
        const result = await platformManagementApi.getStats();
        if (result.success) {
            return result.stats;
        }
        throw new Error('Failed to fetch stats');
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Return empty stats on error
        return {
            totalStores: 0,
            activeStores: 0,
            activeStoresThisMonth: 0,
            pendingStores: 0,
            totalUsers: 0,
            activeUsers: 0,
            totalAppointments: 0,
            appointmentsToday: 0,
            totalRevenue: 'R$ 0,00',
            revenueThisMonth: 0,
            openComplaints: 0,
            pendingSupport: 0,
            openSupportTickets: 0,
            averagePlatformRating: 0,
        };
    }
};

// Update store status
export const updateStoreStatus = async (storeId: string, status: 'active' | 'pending' | 'suspended'): Promise<boolean> => {
    try {
        const result = await platformManagementApi.updateStoreStatus(storeId, status);
        return result.success;
    } catch (error) {
        console.error('Error updating store status:', error);
        return false;
    }
};

// Delete store
export const deleteStore = async (storeId: string): Promise<boolean> => {
    try {
        const result = await platformManagementApi.deleteStore(storeId);
        return result.success;
    } catch (error) {
        console.error('Error deleting store:', error);
        return false;
    }
};

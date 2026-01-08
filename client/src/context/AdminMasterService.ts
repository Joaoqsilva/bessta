// Admin Master Data Service
// Centralizes all platform data for the master admin

import { getStoreAppointments, getStoreCustomers, getStoreServices } from './StoreDataService';

export interface PlatformStats {
    totalStores: number;
    activeStores: number;
    activeStoresThisMonth: number;
    pendingStores: number;
    totalUsers: number;
    activeUsers: number;
    totalAppointments: number;
    appointmentsToday: number;
    totalRevenue: string;
    revenueThisMonth: number;
    openComplaints: number;
    pendingSupport: number;
    openSupportTickets: number;
    averagePlatformRating: number;
}

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

// Get all registered stores from localStorage
export const getAllRegisteredStores = (): RegisteredStore[] => {
    const stores: RegisteredStore[] = [];

    // Scan localStorage for registered stores
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('registered_stores_')) {
            try {
                const storeData = JSON.parse(localStorage.getItem(key) || '{}');
                if (storeData.id) {
                    // Get additional data for this store
                    const appointments = getStoreAppointments(storeData.id);
                    const customers = getStoreCustomers(storeData.id);
                    const services = getStoreServices(storeData.id);

                    // Calculate revenue
                    const totalRevenue = appointments
                        .filter(a => a.status === 'completed')
                        .reduce((sum, a) => sum + (a.servicePrice || 0), 0);

                    stores.push({
                        id: storeData.id,
                        slug: storeData.slug,
                        name: storeData.name,
                        category: storeData.category || 'Serviços',
                        ownerName: storeData.ownerName,
                        ownerEmail: storeData.email,
                        phone: storeData.phone,
                        address: storeData.address || '',
                        status: storeData.status || 'active',
                        plan: storeData.plan || 'free',
                        rating: storeData.rating || 0,
                        totalReviews: storeData.totalReviews || 0,
                        totalCustomers: customers.length,
                        totalAppointments: appointments.length,
                        totalRevenue,
                        createdAt: storeData.createdAt,
                    });
                }
            } catch (e) {
                console.error('Error parsing store data:', e);
            }
        }
    }

    // Also check the bessta_stores key
    try {
        const allStores = JSON.parse(localStorage.getItem('bessta_stores') || '[]');
        for (const storeData of allStores) {
            if (!stores.find(s => s.id === storeData.id)) {
                const appointments = getStoreAppointments(storeData.id);
                const customers = getStoreCustomers(storeData.id);

                const totalRevenue = appointments
                    .filter((a: any) => a.status === 'completed')
                    .reduce((sum: number, a: any) => sum + (a.servicePrice || 0), 0);

                stores.push({
                    id: storeData.id,
                    slug: storeData.slug,
                    name: storeData.name,
                    category: storeData.category || 'Serviços',
                    ownerName: storeData.ownerName,
                    ownerEmail: storeData.email,
                    phone: storeData.phone,
                    address: storeData.address || '',
                    status: storeData.status || 'active',
                    plan: storeData.plan || 'free',
                    rating: storeData.rating || 0,
                    totalReviews: storeData.totalReviews || 0,
                    totalCustomers: customers.length,
                    totalAppointments: appointments.length,
                    totalRevenue,
                    createdAt: storeData.createdAt,
                });
            }
        }
    } catch (e) {
        console.error('Error parsing bessta_stores:', e);
    }

    return stores;
};

// Calculate platform statistics
export const getPlatformStats = (): PlatformStats => {
    const stores = getAllRegisteredStores();
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    let totalAppointments = 0;
    let appointmentsToday = 0;
    let totalRevenue = 0;
    let revenueThisMonth = 0;
    let totalRating = 0;
    let ratingCount = 0;
    let totalCustomers = 0;

    stores.forEach(store => {
        const appointments = getStoreAppointments(store.id);
        const customers = getStoreCustomers(store.id);

        totalAppointments += appointments.length;
        totalCustomers += customers.length;

        appointments.forEach(apt => {
            if (apt.date === today) {
                appointmentsToday++;
            }
            if (apt.status === 'completed') {
                totalRevenue += apt.servicePrice || 0;
                if (apt.date?.startsWith(thisMonth)) {
                    revenueThisMonth += apt.servicePrice || 0;
                }
            }
        });

        if (store.rating > 0) {
            totalRating += store.rating;
            ratingCount++;
        }
    });

    const activeStores = stores.filter(s => s.status === 'active').length;
    const pendingStores = stores.filter(s => s.status === 'pending').length;
    const activeThisMonth = stores.filter(s => s.createdAt?.startsWith(thisMonth)).length;

    return {
        totalStores: stores.length,
        activeStores,
        activeStoresThisMonth: activeThisMonth,
        pendingStores,
        totalUsers: totalCustomers,
        activeUsers: totalCustomers,
        totalAppointments,
        appointmentsToday,
        totalRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
        revenueThisMonth,
        openComplaints: 0,
        pendingSupport: 0,
        openSupportTickets: 0,
        averagePlatformRating: ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0,
    };
};

// Update store status
export const updateStoreStatus = (storeId: string, status: 'active' | 'pending' | 'suspended'): boolean => {
    try {
        const allStores = JSON.parse(localStorage.getItem('bessta_stores') || '[]');
        const storeIndex = allStores.findIndex((s: any) => s.id === storeId);

        if (storeIndex !== -1) {
            allStores[storeIndex].status = status;
            localStorage.setItem('bessta_stores', JSON.stringify(allStores));
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error updating store status:', e);
        return false;
    }
};

// Delete store
export const deleteStore = (storeId: string): boolean => {
    try {
        const allStores = JSON.parse(localStorage.getItem('bessta_stores') || '[]');
        const filtered = allStores.filter((s: any) => s.id !== storeId);
        localStorage.setItem('bessta_stores', JSON.stringify(filtered));

        // Also remove store-specific data
        localStorage.removeItem(`store_services_${storeId}`);
        localStorage.removeItem(`store_customers_${storeId}`);
        localStorage.removeItem(`store_appointments_${storeId}`);

        return true;
    } catch (e) {
        console.error('Error deleting store:', e);
        return false;
    }
};

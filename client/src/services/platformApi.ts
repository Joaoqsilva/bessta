// ========================================
// PLATFORM API CLIENT
// Frontend API calls for platform features
// ========================================

import api from './api';

// ============ Platform Settings ============

export interface PlatformSettings {
    _id?: string;
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    supportPhone: string;
    emailNotifications: boolean;
    newStoreAlerts: boolean;
    complaintAlerts: boolean;
    freePlanLimit: number;
    basicPlanPrice: number;
    proPlanPrice: number;
    requireEmailVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    updatedAt?: string;
}

export const platformSettingsApi = {
    getSettings: async (): Promise<PlatformSettings> => {
        const response = await api.get('/platform/settings');
        return response.data;
    },

    updateSettings: async (settings: Partial<PlatformSettings>): Promise<PlatformSettings> => {
        const response = await api.put('/platform/settings', settings);
        return response.data;
    }
};

// ============ Complaints ============

export interface Complaint {
    _id?: string;
    title: string;
    description: string;
    type: 'service' | 'store' | 'payment' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complainantId?: string;
    complainantName: string;
    complainantEmail: string;
    targetStoreId?: string;
    targetStoreName?: string;
    resolution?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ComplaintsResponse {
    complaints: Complaint[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const complaintsApi = {
    getAll: async (params?: { status?: string; priority?: string; page?: number; limit?: number }): Promise<ComplaintsResponse> => {
        const response = await api.get('/complaints', { params });
        return response.data;
    },

    create: async (complaint: Partial<Complaint>): Promise<Complaint> => {
        const response = await api.post('/complaints', complaint);
        return response.data;
    },

    update: async (id: string, updates: Partial<Complaint>): Promise<Complaint> => {
        const response = await api.put(`/complaints/${id}`, updates);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/complaints/${id}`);
    }
};

// ============ Support Tickets ============

export interface TicketResponse {
    message: string;
    responderId: string;
    responderName: string;
    isStaff: boolean;
    createdAt: string;
}

export interface SupportTicket {
    _id?: string;
    subject: string;
    message: string;
    category: 'billing' | 'technical' | 'account' | 'feature' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
    userId: string;
    userName: string;
    userEmail: string;
    storeId?: string;
    storeName?: string;
    responses: TicketResponse[];
    createdAt?: string;
    updatedAt?: string;
}

export interface TicketsResponse {
    tickets: SupportTicket[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const supportApi = {
    getAll: async (params?: { status?: string; category?: string; page?: number; limit?: number }): Promise<TicketsResponse> => {
        const response = await api.get('/support', { params });
        return response.data;
    },

    getById: async (id: string): Promise<SupportTicket> => {
        const response = await api.get(`/support/${id}`);
        return response.data;
    },

    create: async (ticket: Partial<SupportTicket>): Promise<SupportTicket> => {
        const response = await api.post('/support', ticket);
        return response.data;
    },

    createPublic: async (ticket: { subject: string; message: string; name: string; email: string; category?: string; storeId?: string }): Promise<SupportTicket> => {
        const response = await api.post('/support/public', ticket);
        return response.data;
    },

    update: async (id: string, updates: Partial<SupportTicket> & { response?: string }): Promise<SupportTicket> => {
        const response = await api.put(`/support/${id}`, updates);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/support/${id}`);
    }
};

// ============ Reviews ============

export interface Review {
    _id?: string;
    storeId: string;
    customerName: string;
    customerEmail?: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    isVisible: boolean;
    ownerResponse?: string;
    ownerResponseAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReviewsResponse {
    reviews: Review[];
    stats: {
        averageRating: number;
        totalReviews: number;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const reviewsApi = {
    getByStore: async (storeId: string, params?: { page?: number; limit?: number }): Promise<ReviewsResponse> => {
        const response = await api.get(`/reviews/store/${storeId}`, { params });
        return response.data;
    },

    create: async (storeId: string, review: { customerName: string; customerEmail?: string; rating: number; comment: string }): Promise<Review> => {
        const response = await api.post(`/reviews/store/${storeId}`, review);
        return response.data;
    },

    respond: async (reviewId: string, ownerResponse: string): Promise<Review> => {
        const response = await api.put(`/reviews/${reviewId}/respond`, { ownerResponse });
        return response.data;
    },

    delete: async (reviewId: string): Promise<void> => {
        await api.delete(`/reviews/${reviewId}`);
    }
};

// Admin Platform Management
export const platformManagementApi = {
    getStats: async () => {
        const response = await api.get('/platform/stats');
        return {
            success: true,
            stats: response.data
        };
    },

    getStores: async () => {
        const response = await api.get('/platform/stores');
        return {
            success: true,
            stores: response.data
        };
    },

    updateStoreStatus: async (storeId: string, status: 'active' | 'pending' | 'suspended') => {
        const response = await api.patch(`/platform/stores/${storeId}/status`, { status });
        return {
            success: true,
            store: response.data
        };
    },

    deleteStore: async (storeId: string) => {
        await api.delete(`/platform/stores/${storeId}`);
        return {
            success: true
        };
    }
};

// Export all
export default {
    platformSettings: platformSettingsApi,
    complaints: complaintsApi,
    support: supportApi,
    reviews: reviewsApi,
    management: platformManagementApi
};

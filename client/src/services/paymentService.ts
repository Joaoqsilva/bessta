// ========================================
// PAYMENT SERVICE
// Stripe integration for subscriptions
// ========================================

import api from './api';

export interface SubscriptionStatus {
    plan: 'free' | 'basic' | 'pro';
    subscription: {
        id: string;
        status: string;
        currentPeriodEnd: string;
        cancelAtPeriodEnd: boolean;
    } | null;
}

export const paymentService = {
    // Create checkout session for Pro plan
    createCheckoutSession: async (): Promise<{ success: boolean; url: string; sessionId: string }> => {
        const response = await api.post('/payments/create-checkout-session');
        return response.data;
    },

    // Create customer portal session (manage subscription)
    createPortalSession: async (): Promise<{ success: boolean; url: string }> => {
        const response = await api.post('/payments/create-portal-session');
        return response.data;
    },

    // Get subscription status
    getSubscriptionStatus: async (): Promise<{ success: boolean } & SubscriptionStatus> => {
        const response = await api.get('/payments/subscription-status');
        return response.data;
    },

    // Verify checkout session and update plan
    verifySession: async (sessionId: string): Promise<{ success: boolean; plan?: string; message?: string }> => {
        const response = await api.post('/payments/verify-session', { sessionId });
        return response.data;
    },
};

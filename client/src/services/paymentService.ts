// ========================================
// PAYMENT SERVICE
// Mercado Pago integration for subscriptions
// ========================================

import api from './api';

export interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
}

export interface SubscriptionStatus {
    plan: string;
    planName: string;
    status: 'active' | 'cancelled' | 'pending' | 'expired';
    endDate: string | null;
    features: string[];
    price: number;
}

export const PLANS: Plan[] = [
    {
        id: 'start',
        name: 'Start',
        price: 0,
        features: ['1 profissional', 'Agendamentos ilimitados', 'Página personalizada']
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 49.90,
        features: ['5 profissionais', 'Lembretes por email', 'Relatórios básicos', 'Suporte prioritário']
    },
    {
        id: 'business',
        name: 'Business',
        price: 99.90,
        features: ['Profissionais ilimitados', 'Lembretes por WhatsApp', 'Relatórios avançados', 'API access', 'Suporte 24/7']
    }
];

export const paymentService = {
    // Get available plans
    getPlans: (): Plan[] => {
        return PLANS;
    },

    // Get plan by ID
    getPlan: (planId: string): Plan | undefined => {
        return PLANS.find(p => p.id === planId);
    },

    // Get current subscription status
    getSubscription: async (): Promise<{ success: boolean; subscription: SubscriptionStatus }> => {
        const response = await api.get('/mercadopago/subscription');
        return response.data;
    },

    // Create payment preference (for Checkout Pro redirect)
    createPreference: async (planId: string): Promise<{
        success: boolean;
        preferenceId: string;
        initPoint: string;
        sandboxInitPoint: string;
    }> => {
        const response = await api.post('/mercadopago/create-preference', { planId });
        return response.data;
    },

    // Process card payment (for Bricks - inline checkout)
    processCardPayment: async (paymentData: {
        token: string;
        issuer_id: string;
        payment_method_id: string;
        installments: number;
        payer: {
            email: string;
            identification: {
                type: string;
                number: string;
            };
        };
        planId: string;
    }): Promise<{ success: boolean; status: string; id: number }> => {
        const response = await api.post('/mercadopago/process-payment', paymentData);
        return response.data;
    },

    // Create PIX payment
    createPixPayment: async (planId: string, payer: {
        email: string;
        first_name: string;
        last_name: string;
        identification: {
            type: string;
            number: string;
        };
    }): Promise<{
        success: boolean;
        id: number;
        status: string;
        qr_code: string;
        qr_code_base64: string;
        ticket_url: string;
    }> => {
        const response = await api.post('/mercadopago/create-pix', { planId, payer });
        return response.data;
    },

    // Check payment status
    checkPaymentStatus: async (paymentId: string): Promise<{
        success: boolean;
        status: string;
        status_detail: string;
    }> => {
        const response = await api.get(`/mercadopago/status/${paymentId}`);
        return response.data;
    },

    // Cancel subscription
    cancelSubscription: async (): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/mercadopago/cancel');
        return response.data;
    }
};

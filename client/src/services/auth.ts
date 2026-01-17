import api from './api';
import type { User, UserStore } from '../context/AuthContext';

interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    store: UserStore;
    error?: string;
}

interface RegisterData {
    storeName?: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    category?: string;
    role?: 'store_owner' | 'client_user';
    storeId?: string;
}

export const authService = {
    // Register new user and store
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Login with Google OAuth
    googleLogin: async (credential: string): Promise<AuthResponse & { isNewUser?: boolean }> => {
        const response = await api.post('/auth/google', { credential });
        return response.data;
    },

    // Get current user profile
    getProfile: async (): Promise<AuthResponse> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>): Promise<AuthResponse> => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data: { email: string; code: string; newPassword: string }): Promise<{ success: boolean; message?: string; error?: string }> => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },

    verifyEmail: async (email: string, code: string): Promise<AuthResponse & { message?: string }> => {
        const response = await api.post('/auth/verify-email', { email, code });
        return response.data;
    },

    resendVerification: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
    }
};

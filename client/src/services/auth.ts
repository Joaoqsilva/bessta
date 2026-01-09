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
    storeName: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    category?: string;
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

    // Get current user profile
    getProfile: async (): Promise<AuthResponse> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>): Promise<AuthResponse> => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    }
};

// Auth context for managing user authentication and store data
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
// import { initializeStoreData } from './StoreDataService'; // Legacy

import { storeApi } from '../services/storeApi';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/auth';
import type { StoreCustomization } from './StoreCustomizationService';
import { resetStoreCustomization, saveStoreCustomization } from './StoreCustomizationService';
import { getTemplateByCategory } from '../constants/templates';
import type { User, Store as UserStore, Service, WorkingHours as WorkingHour } from '../types';

// Re-export UserStore as it was used locally
export type { UserStore, User, Service, WorkingHour };

interface AuthContextType {
    user: User | null;
    store: UserStore | null;
    isAuthenticated: boolean;
    isAdminMaster: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    googleLogin: (credential: string) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => void;
    updateStore: (updates: Partial<UserStore>) => void;
}

interface RegisterData {
    storeName: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    category?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'bookme_token',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [store, setStore] = useState<UserStore | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from API on mount if token exists
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Verify token and get profile from backend
                const data = await authService.getProfile();
                if (data.success && data.user) {
                    setUser(data.user);
                    if (data.store) {
                        setStore(data.store);
                    }
                } else {
                    // Invalid token or session
                    logout();
                }
            } catch (error) {
                console.error('Error verifying session:', error);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const data = await authService.login(email, password);

            if (data.success && data.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
                setUser(data.user);
                setStore(data.store);

                // Initialize local store data for services/appointments (temporary hybrid mode)
                // until we migrate those to backend too
                if (data.store?.id) {
                    // initializeStoreData(data.store.id);
                }

                setIsLoading(false);
                return true;
            }

            setIsLoading(false);
            return false;
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
            return false;
        }
    };

    const googleLogin = async (credential: string): Promise<boolean> => {
        // Todo: Implement Google Login with backend
        // For now this might need to be adjusted to send token to backend
        console.warn('Google login not yet implemented on backend');
        return false;
    };

    const register = async (data: RegisterData): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);

            if (response.success && response.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);

                // Initialize features
                if (response.store?.id) {
                    const storeId = response.store.id;

                    // 1. Initialize local data (legacy/hybrid)
                    // initializeStoreData(storeId);

                    try {
                        // 2. Setup initial customization via API
                        const initialCustomization = await resetStoreCustomization(storeId);

                        // 3. Apply template based on category
                        const template = getTemplateByCategory(data.category || 'other');

                        const customizedStore = {
                            ...initialCustomization,
                            ...template.defaultCustomization,
                            storeId: storeId, // Ensure storeId is set
                            updatedAt: new Date().toISOString()
                        };

                        // Adjust specific text if needed
                        if (template.category === 'health' && customizedStore.welcomeTitle === '') {
                            customizedStore.welcomeTitle = `Olá, eu sou ${data.ownerName.split(' ')[0]}`;
                        }

                        await saveStoreCustomization(customizedStore as StoreCustomization);

                        // Update local state with new customization
                        if (response.store) {
                            response.store.customization = customizedStore;
                        }

                    } catch (customizationError) {
                        console.error('Failed to initialize store customization:', customizationError);
                        // Continue login even if customization fails
                    }
                }

                setUser(response.user);
                setStore(response.store);

                setIsLoading(false);
                return true;
            }

            setIsLoading(false);
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setStore(null);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        // Optional: clear other local data if desired
    };

    const updateStore = (updates: Partial<UserStore>) => {
        if (!store) return;
        setStore({ ...store, ...updates });
        // TODO: Sync with backend
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                store,
                isAuthenticated: !!user,
                isAdminMaster: user?.role === 'admin_master',
                isLoading,
                login,
                googleLogin,
                register,
                logout,
                updateStore,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper hook to get a store by slug (for public booking page)
export const useStoreBySlug = (slug: string) => {
    const [store, setStore] = useState<UserStore | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const fetchStore = async () => {
            try {
                const response = await storeApi.getBySlug(slug);
                if (response.success && response.store) {
                    setStore(response.store);
                } else {
                    setStore(null);
                    setError('Loja não encontrada');
                }
            } catch (error) {
                console.error('Error fetching store by slug:', error);
                setStore(null);
                setError('Erro ao carregar loja');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStore();
    }, [slug]);

    return { store, isLoading, error };
};

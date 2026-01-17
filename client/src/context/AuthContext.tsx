// Auth context for managing user authentication and store data
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
// import { initializeStoreData } from './StoreDataService'; // Legacy

import { storeApi } from '../services/storeApi';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/auth';
import type { StoreCustomization } from './StoreCustomizationService';
import { resetStoreCustomization, saveStoreCustomization } from './StoreCustomizationService';
import { getTemplateByCategory } from '../constants/templates';
import type { User, Store as UserStore, Service, WorkingHours as WorkingHour } from '../types';

// Re-export UserStore as it was used locally
export type { UserStore, User, Service, WorkingHour };

// ===============================
// BYPASS LOGIN CONFIGURATION
// ===============================
// This allows access to the system without needing the backend/database
const BYPASS_CREDENTIALS = {
    email: 'bypass@store',
    password: 'bypass123',
};

const BYPASS_USER: User = {
    id: 'bypass-user-001',
    email: 'bypass@store',
    name: 'Usuário Bypass',
    ownerName: 'Admin Bypass',
    phone: '(00) 00000-0000',
    role: 'store_owner',
    createdAt: new Date().toISOString(),
    isActive: true,
    plan: 'pro',
};

const BYPASS_STORE: UserStore = {
    id: 'bypass-store-001',
    slug: 'bypass-store',
    name: 'Loja Bypass',
    description: 'Loja de demonstração para testes offline',
    category: 'health',
    address: 'Rua Demo, 123 - Centro',
    phone: '(00) 00000-0000',
    email: 'bypass@store',
    image: '',
    ownerId: 'bypass-user-001',
    ownerName: 'Admin Bypass',
    services: [
        {
            id: 'bypass-service-1',
            name: 'Serviço Demo 1',
            description: 'Serviço de demonstração',
            duration: 60,
            durationDisplay: '1h',
            price: 100,
            currency: 'BRL',
            isActive: true,
        },
        {
            id: 'bypass-service-2',
            name: 'Serviço Demo 2',
            description: 'Outro serviço de demonstração',
            duration: 30,
            durationDisplay: '30min',
            price: 50,
            currency: 'BRL',
            isActive: true,
        },
    ],
    workingHours: [
        { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '18:00' },
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
    plan: 'pro',
    weeklyTimeSlots: {
        0: [],
        1: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        2: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        3: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        4: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        5: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        6: [],
    },
};

const BYPASS_TOKEN = 'bypass-local-token-no-server';

const isBypassLogin = (email: string, password: string): boolean => {
    return email === BYPASS_CREDENTIALS.email && password === BYPASS_CREDENTIALS.password;
};

const handleBypassLogin = (): { user: User; store: UserStore; token: string } => {
    return {
        user: BYPASS_USER,
        store: BYPASS_STORE,
        token: BYPASS_TOKEN,
    };
};

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

            // Check if it's a bypass token (no server needed)
            if (token === BYPASS_TOKEN) {
                console.log('🔓 Sessão bypass restaurada - usando dados locais');
                setUser(BYPASS_USER);
                setStore(BYPASS_STORE);
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
                // If in development and API fails, don't logout - just show login
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        // Check for bypass login (works without server/database)
        if (isBypassLogin(email, password)) {
            console.log('🔓 Bypass login ativado - usando dados locais');
            const bypassData = handleBypassLogin();
            localStorage.setItem(STORAGE_KEYS.TOKEN, bypassData.token);
            setUser(bypassData.user);
            setStore(bypassData.store);
            setIsLoading(false);
            return true;
        }

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
        setIsLoading(true);
        try {
            const response = await authService.googleLogin(credential);

            if (response.success && response.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);

                // Initialize features for new users
                if (response.isNewUser && response.store?.id) {
                    const storeId = response.store.id;
                    try {
                        await resetStoreCustomization(storeId);
                    } catch (e) {
                        console.warn('Failed to initialize customization:', e);
                    }
                }

                setUser(response.user);
                if (response.store) {
                    setStore({
                        ...response.store,
                        phone: response.user.phone || '',
                        ownerName: response.user.ownerName || '',
                    });
                }

                setIsLoading(false);
                return true;
            }

            setIsLoading(false);
            return false;
        } catch (error: any) {
            console.error('Google login error:', error);
            setIsLoading(false);
            return false;
        }
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

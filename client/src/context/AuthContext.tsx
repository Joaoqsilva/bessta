// Auth context for managing user authentication and store data
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { initializeStoreData } from './StoreDataService';
import { resetStoreCustomization, saveStoreCustomization } from './StoreCustomizationService';
import { getTemplateByCategory } from '../constants/templates';
import { jwtDecode } from 'jwt-decode';

export interface User {
    id: string;
    email: string;
    ownerName: string;
    phone: string;
    storeId: string;
    role: 'store_owner' | 'admin_master';
    createdAt: string;
}

export interface UserStore {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    address: string;
    phone: string;
    email: string;
    ownerId: string;
    ownerName: string;
    rating: number;
    totalReviews: number;
    status: 'active' | 'pending' | 'suspended';
    plan: 'free' | 'basic' | 'pro';
    services: Service[];
    workingHours: WorkingHour[];
    createdAt: string;
    // Custom domain fields
    customDomain?: string;
    domainVerified?: boolean;
    domainVerificationCode?: string;
}

export interface Service {
    id: number;
    name: string;
    description: string;
    duration: number;
    durationDisplay: string;
    price: number;
    currency: string;
    isActive: boolean;
}

export interface WorkingHour {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}
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

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to create slug from store name
const createSlug = (name: string) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Default working hours
const defaultWorkingHours: WorkingHour[] = [
    { dayOfWeek: 0, isOpen: false, openTime: '', closeTime: '' },
    { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' },
];

// Default services
const defaultServices: Service[] = [
    { id: 1, name: 'Serviço 1', description: 'Descrição do serviço', duration: 30, durationDisplay: '30 min', price: 50, currency: 'BRL', isActive: true },
];

// Storage keys
const STORAGE_KEYS = {
    CURRENT_USER: 'bessta_current_user',
    USERS: 'bessta_users',
    STORES: 'bessta_stores',
};

// Admin Master Credentials (hardcoded for this demo)
const ADMIN_MASTER = {
    id: 'admin-master-001',
    email: 'admin@bessta.com',
    password: 'admin123',
    ownerName: 'Administrador Master',
    phone: '',
    storeId: '',
    role: 'admin_master' as const,
    createdAt: '2025-01-01T00:00:00Z',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [store, setStore] = useState<UserStore | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser) as User;
                    setUser(parsedUser);

                    // Load store data
                    const stores = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORES) || '[]') as UserStore[];
                    const userStore = stores.find(s => s.id === parsedUser.storeId);
                    if (userStore) {
                        setStore(userStore);
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check for Admin Master login first
            if (email === ADMIN_MASTER.email && password === ADMIN_MASTER.password) {
                const { password: _, ...adminWithoutPassword } = ADMIN_MASTER;
                setUser(adminWithoutPassword);
                setStore(null); // Admin Master has no store
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminWithoutPassword));
                setIsLoading(false);
                return true;
            }

            // Get all regular users
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as (User & { password: string })[];

            // Find user by email and password
            const foundUser = users.find(u => u.email === email && u.password === password);

            if (!foundUser) {
                setIsLoading(false);
                return false;
            }

            // Remove password from user object
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

            // Load store data
            const stores = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORES) || '[]') as UserStore[];
            const userStore = stores.find(s => s.id === foundUser.storeId);
            if (userStore) {
                setStore(userStore);
            }

            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
            return false;
        }
    };

    const googleLogin = async (credential: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const decoded: any = jwtDecode(credential);
            const { email, name, sub } = decoded;

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get all regular users
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as (User & { password: string })[];

            // Find user by email
            const foundUser = users.find(u => u.email === email);

            if (foundUser) {
                // **LOGIN FLOW**
                const { password: _, ...userWithoutPassword } = foundUser;
                setUser(userWithoutPassword);
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

                const stores = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORES) || '[]') as UserStore[];
                const userStore = stores.find(s => s.id === foundUser.storeId);
                if (userStore) setStore(userStore);

                setIsLoading(false);
                return true;
            } else {
                // **REGISTER FLOW**
                // Auto-register
                return await register({
                    email,
                    password: generateId(),
                    ownerName: name,
                    storeName: `${name.split(' ')[0]}'s Store`,
                    phone: '',
                    category: 'beauty'
                });
            }
        } catch (error) {
            console.error('Google login error:', error);
            setIsLoading(false);
            return false;
        }
    };

    const register = async (data: RegisterData): Promise<boolean> => {
        setIsLoading(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Get existing users and stores
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as (User & { password: string })[];
            const stores = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORES) || '[]') as UserStore[];

            // Check if email already exists
            if (users.some(u => u.email === data.email)) {
                setIsLoading(false);
                return false;
            }

            // Generate IDs
            const userId = generateId();
            const storeId = generateId();
            const storeSlug = createSlug(data.storeName);

            // Create new store
            const newStore: UserStore = {
                id: storeId,
                slug: storeSlug,
                name: data.storeName,
                description: `Bem-vindo à ${data.storeName}! Agende seu horário conosco.`,
                category: data.category || 'Serviços',
                address: '',
                phone: data.phone,
                email: data.email,
                ownerId: userId,
                ownerName: data.ownerName,
                rating: 5.0,
                totalReviews: 0,
                status: 'active',
                plan: 'free',
                services: defaultServices,
                workingHours: defaultWorkingHours,
                createdAt: new Date().toISOString(),
            };

            // Create new user
            const newUser: User & { password: string } = {
                id: userId,
                email: data.email,
                ownerName: data.ownerName,
                phone: data.phone,
                storeId: storeId,
                role: 'store_owner',
                password: data.password,
                createdAt: new Date().toISOString(),
            };

            // Save to localStorage
            users.push(newUser);
            stores.push(newStore);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));

            // Initialize store-specific data (services, customers, appointments)
            initializeStoreData(storeId);

            // Apply Store Template based on Category
            const initialCustomization = resetStoreCustomization(storeId);
            const template = getTemplateByCategory(data.category || 'other');

            const customizedStore = {
                ...initialCustomization,
                ...template.defaultCustomization,
                updatedAt: new Date().toISOString()
            };

            // Adjust specific text if needed
            if (template.category === 'health' && customizedStore.welcomeTitle === '') {
                customizedStore.welcomeTitle = `Olá, eu sou ${data.ownerName.split(' ')[0]}`;
            }

            saveStoreCustomization(customizedStore as any);

            // Set current user (without password)
            const { password: _, ...userWithoutPassword } = newUser;
            setUser(userWithoutPassword);
            setStore(newStore);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setStore(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    };

    const updateStore = (updates: Partial<UserStore>) => {
        if (!store) return;

        const updatedStore = { ...store, ...updates };
        setStore(updatedStore);

        // Update in localStorage
        const stores = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORES) || '[]') as UserStore[];
        const storeIndex = stores.findIndex(s => s.id === store.id);
        if (storeIndex !== -1) {
            stores[storeIndex] = updatedStore;
            localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
        }
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
export const useStoreBySlug = (slug: string): UserStore | null => {
    const [store, setStore] = useState<UserStore | null>(null);

    useEffect(() => {
        const stores = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORES) || '[]') as UserStore[];
        const foundStore = stores.find(s => s.slug === slug);
        setStore(foundStore || null);
    }, [slug]);

    return store;
};

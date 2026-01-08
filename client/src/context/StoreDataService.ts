// Store-specific data management
// This service handles storing and retrieving data that is specific to each store

import type { Appointment, Customer, Service } from '../types';

export interface StoreData {
    services: Service[];
    customers: Customer[];
    appointments: Appointment[];
}

const STORAGE_KEY_PREFIX = 'bessta_store_data_';

// Get store-specific storage key
const getStorageKey = (storeId: string) => `${STORAGE_KEY_PREFIX}${storeId}`;

// Default data for new stores
const getDefaultStoreData = (): StoreData => ({
    services: [
        {
            id: 1,
            name: 'Serviço Exemplo',
            description: 'Descreva seu serviço aqui',
            duration: 30,
            durationDisplay: '30 min',
            price: 50,
            currency: 'BRL',
            isActive: true,
        },
    ],
    customers: [],
    appointments: [],
});

// Get data for a specific store
export const getStoreData = (storeId: string): StoreData => {
    try {
        const stored = localStorage.getItem(getStorageKey(storeId));
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading store data:', error);
    }
    return getDefaultStoreData();
};

// Save data for a specific store
export const saveStoreData = (storeId: string, data: StoreData): void => {
    try {
        localStorage.setItem(getStorageKey(storeId), JSON.stringify(data));
    } catch (error) {
        console.error('Error saving store data:', error);
    }
};

// Services
export const getStoreServices = (storeId: string): Service[] => {
    const data = getStoreData(storeId);
    return data.services;
};

export const saveStoreServices = (storeId: string, services: Service[]): void => {
    const data = getStoreData(storeId);
    data.services = services;
    saveStoreData(storeId, data);
};

export const addStoreService = (storeId: string, service: Omit<Service, 'id'>): Service => {
    const data = getStoreData(storeId);
    const newId = data.services.length > 0 ? Math.max(...data.services.map(s => s.id)) + 1 : 1;
    const newService = { ...service, id: newId };
    data.services.push(newService);
    saveStoreData(storeId, data);
    return newService;
};

export const updateStoreService = (storeId: string, serviceId: number, updates: Partial<Service>): void => {
    const data = getStoreData(storeId);
    const index = data.services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
        data.services[index] = { ...data.services[index], ...updates };
        saveStoreData(storeId, data);
    }
};

export const deleteStoreService = (storeId: string, serviceId: number): void => {
    const data = getStoreData(storeId);
    data.services = data.services.filter(s => s.id !== serviceId);
    saveStoreData(storeId, data);
};

// Customers
export const getStoreCustomers = (storeId: string): Customer[] => {
    const data = getStoreData(storeId);
    return data.customers;
};

export const saveStoreCustomers = (storeId: string, customers: Customer[]): void => {
    const data = getStoreData(storeId);
    data.customers = customers;
    saveStoreData(storeId, data);
};

export const addStoreCustomer = (storeId: string, customer: Omit<Customer, 'id'>): Customer => {
    const data = getStoreData(storeId);
    const newId = data.customers.length > 0 ? Math.max(...data.customers.map(c => c.id)) + 1 : 1;
    const newCustomer = { ...customer, id: newId };
    data.customers.push(newCustomer);
    saveStoreData(storeId, data);
    return newCustomer;
};

export const updateStoreCustomer = (storeId: string, customerId: number, updates: Partial<Customer>): void => {
    const data = getStoreData(storeId);
    const index = data.customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
        data.customers[index] = { ...data.customers[index], ...updates };
        saveStoreData(storeId, data);
    }
};

export const deleteStoreCustomer = (storeId: string, customerId: number): void => {
    const data = getStoreData(storeId);
    data.customers = data.customers.filter(c => c.id !== customerId);
    saveStoreData(storeId, data);
};

// Appointments
export const getStoreAppointments = (storeId: string): Appointment[] => {
    const data = getStoreData(storeId);
    return data.appointments;
};

export const saveStoreAppointments = (storeId: string, appointments: Appointment[]): void => {
    const data = getStoreData(storeId);
    data.appointments = appointments;
    saveStoreData(storeId, data);
};

export const addStoreAppointment = (storeId: string, appointment: Omit<Appointment, 'id'>): Appointment => {
    const data = getStoreData(storeId);
    const newId = data.appointments.length > 0 ? Math.max(...data.appointments.map(a => a.id)) + 1 : 1;
    const newAppointment = { ...appointment, id: newId };
    data.appointments.push(newAppointment);
    saveStoreData(storeId, data);
    return newAppointment;
};

export const updateStoreAppointment = (storeId: string, appointmentId: number, updates: Partial<Appointment>): void => {
    const data = getStoreData(storeId);
    const index = data.appointments.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
        data.appointments[index] = { ...data.appointments[index], ...updates };
        saveStoreData(storeId, data);
    }
};

export const deleteStoreAppointment = (storeId: string, appointmentId: number): void => {
    const data = getStoreData(storeId);
    data.appointments = data.appointments.filter(a => a.id !== appointmentId);
    saveStoreData(storeId, data);
};

// Initialize store data when a new store is created
export const initializeStoreData = (storeId: string): void => {
    const existing = localStorage.getItem(getStorageKey(storeId));
    if (!existing) {
        saveStoreData(storeId, getDefaultStoreData());
    }
};

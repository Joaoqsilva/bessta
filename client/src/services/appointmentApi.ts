import api from './api';
import type { Appointment } from '../types';

export interface CreateAppointmentData {
    storeId: string;
    serviceId: string;
    date: string; // ISO
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
}

export const appointmentApi = {
    // List appointments
    list: async (storeId: string, filters?: { date?: string; status?: string }): Promise<{ success: boolean; appointments: Appointment[] }> => {
        const params = new URLSearchParams();
        if (filters?.date) params.append('date', filters.date);
        if (filters?.status) params.append('status', filters.status);

        const response = await api.get(`/appointments/store/${storeId}?${params.toString()}`);
        return response.data;
    },

    // Create appointment
    create: async (data: CreateAppointmentData): Promise<{ success: boolean; appointment: Appointment }> => {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    // Update status
    updateStatus: async (id: string, status: string): Promise<{ success: boolean; appointment: Appointment }> => {
        const response = await api.put(`/appointments/${id}/status`, { status });
        return response.data;
    }
};

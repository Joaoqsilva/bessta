import type { Store, Appointment, StoreStats, Complaint, SupportTicket } from '../types';

// ===============================
// EMPTY MOCK DATA - FOR FRESH START
// ===============================

// No demo stores - users will create their own
export const MOCK_STORE: Store | null = null;

// No demo appointments
export const MOCK_APPOINTMENTS: Appointment[] = [];

// Empty stats
export const MOCK_STATS: StoreStats = {
    appointmentsToday: 0,
    appointmentsWeek: 0,
    appointmentsMonth: 0,
    pendingRequests: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    averageRating: 0,
    completionRate: 0,
};

// ===============================
// PLATFORM DATA (ADMIN MASTER)
// ===============================

export const MOCK_PLATFORM_STATS = {
    totalStores: 0,
    activeStores: 0,
    activeStoresThisMonth: 0,
    pendingStores: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    totalRevenue: 'R$ 0',
    revenueThisMonth: 0,
    openComplaints: 0,
    pendingSupport: 0,
    openSupportTickets: 0,
    averagePlatformRating: 0,
};

// No demo stores
export const MOCK_ALL_STORES: any[] = [];

// Legacy format for backward compatibility
export const MOCK_STORES = MOCK_ALL_STORES;

// ===============================
// COMPLAINTS DATA
// ===============================

export const MOCK_COMPLAINTS: Complaint[] = [];

// ===============================
// SUPPORT TICKETS DATA
// ===============================

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [];

// ===============================
// TIME SLOTS HELPERS
// ===============================

export const generateTimeSlots = (start: string, end: string, interval: number): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        currentMinutes += interval;
    }

    return slots;
};

export const AVAILABLE_TIME_SLOTS = generateTimeSlots('09:00', '19:00', 30);

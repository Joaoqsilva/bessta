// ===============================
// USER TYPES
// ===============================

export type UserRole = 'customer' | 'store_owner' | 'admin_master';

export interface User {
    id: string;
    email: string;
    name: string;
    ownerName?: string; // Legacy compatibility
    phone?: string;
    avatar?: string;
    role: UserRole;
    createdAt: string;
    isActive: boolean;
}

export interface StoreOwner extends User {
    role: 'store_owner';
    storeId: string;
    plan: 'free' | 'basic' | 'pro';
    planExpiresAt?: string;
}

export interface AdminMaster extends User {
    role: 'admin_master';
    permissions: string[];
}

// ===============================
// STORE TYPES
// ===============================

export interface Store {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    address: string;
    phone: string;
    email: string;
    image: string;
    coverImage?: string;
    logo?: string;
    ownerId: string;
    ownerName: string;
    services: Service[];
    workingHours: WorkingHours[];
    rating?: number;
    totalReviews?: number;
    status: 'active' | 'pending' | 'suspended';
    createdAt: string;
    customization?: StoreCustomization;
    domainVerified?: boolean;
    customDomain?: string;
    plan?: 'free' | 'basic' | 'pro';
    weeklyTimeSlots?: Record<number, string[]>;
}

export interface WorkingHours {
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breakStart?: string;
    breakEnd?: string;
}

export interface StoreCustomization {
    storeId: string;
    // Cores
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    // Imagens
    logo: string | null;
    coverImage: string | null;
    // Layout
    layout: 'beauty-salon' | 'psychology-office' | 'modern-therapy' | 'sophisticated-therapy' | 'lacanian-clinic';
    daysLayout?: 'grid' | 'list';
    showRating: boolean;
    showAddress: boolean;
    showPhone: boolean;
    // Novos campos
    welcomeTitle?: string;
    welcomeMessage?: string;
    galleryImages?: string[];
    aboutImage?: string | null;
    aboutTitle?: string;
    aboutText?: string;
    textOverrides?: Record<string, { content?: string; color?: string }>;
    specialties?: string[];
    teamImages?: string[];
    iconOverrides?: Record<string, string>;
    // Fontes
    fontFamily: 'inter' | 'poppins' | 'roboto' | 'outfit';
    // Estilos
    buttonBgColor?: string;
    buttonTextColor?: string;
    footerBgColor?: string;
    footerTextColor?: string;
    iconColor?: string;
    buttonStyle: 'rounded' | 'square' | 'pill';
    // Outros
    bannerText: string;
    bannerEnabled: boolean;
    instagram: string;
    whatsapp: string;
    facebook: string;
    updatedAt: string;
}

// ===============================
// SERVICE TYPES
// ===============================

export interface Service {
    id: string | number;
    _id?: string;
    name: string;
    description?: string;
    duration: number; // in minutes
    durationDisplay: string; // e.g. "45 min"
    price: number;
    currency: string;
    category?: string;
    isActive: boolean;
}

// ===============================
// CUSTOMER TYPES
// ===============================

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    totalAppointments: number;
    lastVisit?: string;
    joinedAt: string;
    notes?: string;
}

// ===============================
// APPOINTMENT TYPES
// ===============================

export type AppointmentStatus =
    | 'pending'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export interface Appointment {
    id: string | number;
    _id?: string;
    storeId: string;
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    serviceId: string | number;
    serviceName: string;
    serviceDuration: number;
    servicePrice: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    endTime: string; // HH:mm
    status: AppointmentStatus;
    notes?: string;
    avatar?: string; // Customer initials or image
    createdAt: string;
    updatedAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
}

// ===============================
// STATS TYPES
// ===============================

export interface StoreStats {
    appointmentsToday: number;
    appointmentsWeek: number;
    appointmentsMonth: number;
    pendingRequests: number;
    totalCustomers: number;
    newCustomersThisMonth: number;
    revenueToday: number;
    revenueWeek: number;
    revenueMonth: number;
    averageRating: number;
    completionRate: number;
}

export interface PlatformStats {
    totalStores: number;
    activeStores: number;
    pendingStores: number;
    totalUsers: number;
    activeUsers: number;
    totalAppointments: number;
    appointmentsToday: number;
    totalRevenue: number;
    revenueThisMonth: number;
    openComplaints: number;
    pendingSupport: number;
}

// ===============================
// COMPLAINT & SUPPORT TYPES
// ===============================

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Complaint {
    id: string;
    storeId: string;
    storeName: string;
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    description: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    category: string;
    createdAt: string;
    updatedAt?: string;
    resolvedAt?: string;
    assignedTo?: string;
    resolution?: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    storeId?: string;
    storeName?: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
    priority: ComplaintPriority;
    category: string;
    messages: SupportMessage[];
    createdAt: string;
    updatedAt?: string;
}

export interface SupportMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
    attachments?: string[];
    createdAt: string;
}

// ===============================
// NOTIFICATION TYPES
// ===============================

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    isRead: boolean;
    createdAt: string;
}

// ===============================
// ANALYTICS TYPES
// ===============================

export interface ChartDataPoint {
    label: string;
    value: number;
}

export interface AnalyticsData {
    appointmentsByDay: ChartDataPoint[];
    revenueByDay: ChartDataPoint[];
    servicePopularity: ChartDataPoint[];
    customerRetention: number;
    peakHours: ChartDataPoint[];
}

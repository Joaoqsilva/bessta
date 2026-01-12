import api from './api';

export interface Notification {
    _id: string;
    type: 'appointment' | 'system' | 'support' | 'complaint' | 'payment';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export const notificationService = {
    /**
     * Get all notifications for the current user
     */
    async getNotifications(): Promise<Notification[]> {
        const response = await api.get('/notifications');
        return response.data.notifications;
    },

    /**
     * Get unread notifications count
     */
    async getUnreadCount(): Promise<number> {
        const response = await api.get('/notifications/unread-count');
        return response.data.count;
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(id: string): Promise<void> {
        await api.patch(`/notifications/${id}/read`);
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/read-all');
    },

    /**
     * Delete a notification
     */
    async deleteNotification(id: string): Promise<void> {
        await api.delete(`/notifications/${id}`);
    }
};

export default notificationService;

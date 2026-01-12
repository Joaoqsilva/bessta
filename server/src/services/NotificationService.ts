import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

export class NotificationService {
    /**
     * Create a new notification for a user
     * @param recipient User ID who will receive the notification
     * @param type Type of notification
     * @param title Title of the notification
     * @param message Detailed message
     * @param link Optional link for the frontend to navigate to
     */
    static async create(
        recipient: string | mongoose.Types.ObjectId,
        type: 'appointment' | 'system' | 'support' | 'complaint' | 'payment',
        title: string,
        message: string,
        link?: string
    ) {
        try {
            const notification = new Notification({
                recipient,
                type,
                title,
                message,
                link
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            // We don't throw here to avoid breaking the main operation
            // (e.g. if an appointment is booked but notification fails)
            return null;
        }
    }

    /**
     * Get unread notification count for a user
     */
    static async getUnreadCount(userId: string | mongoose.Types.ObjectId) {
        return Notification.countDocuments({ recipient: userId, read: false });
    }
}

export default NotificationService;

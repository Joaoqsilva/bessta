
import cron from 'node-cron';
import { Appointment } from '../models/Appointment';
import { Store } from '../models/Store';
import { sendAppointmentReminder } from '../services/mailService';

export const startReminderJob = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        console.log('[ReminderJob] Starting hourly check...');
        try {
            const now = new Date();
            // Look ahead 24 hours
            const timeLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Find appointments:
            // 1. Date is between now and +24h
            // 2. Status is pending or confirmed
            // 3. reminderSent is false/undefined
            // 4. customerEmail is present
            const appointments = await Appointment.find({
                date: { $gte: now, $lte: timeLimit },
                status: { $in: ['pending', 'confirmed'] },
                reminderSent: { $ne: true },
                customerEmail: { $exists: true, $ne: '' }
            }).limit(50); // Limit batch size

            if (appointments.length > 0) {
                console.log(`[ReminderJob] Found ${appointments.length} appointments to remind.`);

                for (const apt of appointments) {
                    try {
                        const store = await Store.findById(apt.storeId);
                        if (store) {
                            await sendAppointmentReminder(apt, store);
                            // Update flag
                            apt.reminderSent = true;
                            await apt.save();
                            console.log(`[ReminderJob] Reminder sent to ${apt.customerEmail} for apt ${apt._id}`);
                        }
                    } catch (err) {
                        console.error(`[ReminderJob] Failed to process apt ${apt._id}:`, err);
                    }
                }
            } else {
                console.log('[ReminderJob] No appointments to remind.');
            }

        } catch (error) {
            console.error('[ReminderJob] Error:', error);
        }
    });

    console.log('⏰ Reminder Job scheduled (every hour).');
};

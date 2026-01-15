// ========================================
// PLATFORM SETTINGS MODEL
// Single document for platform-wide settings
// ========================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformSettings extends Document {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    supportPhone: string;
    // Notifications
    emailNotifications: boolean;
    newStoreAlerts: boolean;
    complaintAlerts: boolean;
    // Plans
    freePlanLimit: number;
    basicPlanPrice: number;
    proPlanPrice: number;
    // Security
    requireEmailVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    // Metadata
    updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>({
    siteName: { type: String, default: 'SimpliAgenda' },
    siteDescription: { type: String, default: 'Plataforma de agendamentos online para negócios locais' },
    supportEmail: { type: String, default: 'suporte@simpliagenda.com.br' },
    supportPhone: { type: String, default: '(11) 99999-9999' },
    emailNotifications: { type: Boolean, default: true },
    newStoreAlerts: { type: Boolean, default: true },
    complaintAlerts: { type: Boolean, default: true },
    freePlanLimit: { type: Number, default: 50 },
    basicPlanPrice: { type: Number, default: 49 },
    proPlanPrice: { type: Number, default: 99 },
    requireEmailVerification: { type: Boolean, default: true },
    maxLoginAttempts: { type: Number, default: 5 },
    sessionTimeout: { type: Number, default: 60 },
    updatedAt: { type: Date, default: Date.now },
});

// Ensure only one document exists
PlatformSettingsSchema.statics.getSettings = async function (): Promise<IPlatformSettings> {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export const PlatformSettings = mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

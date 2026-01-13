// ========================================
// LICENSE KEY MODEL
// Schema for subscription activation keys
// ========================================

import mongoose from 'mongoose';

export interface ILicenseKey {
    _id: mongoose.Types.ObjectId;
    key: string;
    plan: 'free' | 'basic' | 'pro' | 'start' | 'professional' | 'business';
    status: 'active' | 'used' | 'revoked';
    generatedBy: mongoose.Types.ObjectId;
    usedBy?: mongoose.Types.ObjectId;
    usedAt?: Date;
    createdAt: Date;
    expiresAt?: Date; // Optional expiration for the key availability
}

const licenseKeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'start', 'professional', 'business'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'used', 'revoked'],
        default: 'active'
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    usedAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

export const LicenseKey = mongoose.model<ILicenseKey>('LicenseKey', licenseKeySchema);

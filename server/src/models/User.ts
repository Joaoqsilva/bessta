// ========================================
// USER MODEL
// MongoDB Schema for Users
// ========================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/crypto';

// Interface for User document
export interface IUser {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    ownerName: string;
    name?: string;
    phone: string;
    role: 'store_owner' | 'admin_master' | 'client_user';
    storeId?: mongoose.Types.ObjectId;
    isActive: boolean;
    plan: 'free' | 'basic' | 'pro' | 'start' | 'professional' | 'business';
    planExpiresAt?: Date | null;
    // Mercado Pago subscription fields
    subscriptionPlan?: string;
    subscriptionStatus?: 'active' | 'cancelled' | 'pending' | 'expired';
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    mpPaymentId?: string;
    // Google OAuth
    googleId?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    // Email verification
    emailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    save(): Promise<IUser>;
}

// Schema definition
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    ownerName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    role: {
        type: String,
        enum: ['store_owner', 'admin_master', 'client_user'],
        default: 'store_owner',
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'start', 'professional', 'business'],
        default: 'start',
    },
    planExpiresAt: {
        type: Date,
        default: null,
    },
    // Mercado Pago subscription fields
    subscriptionPlan: {
        type: String,
        default: 'start',
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'cancelled', 'pending', 'expired'],
        default: 'active',
    },
    subscriptionStartDate: {
        type: Date,
        default: null,
    },
    subscriptionEndDate: {
        type: Date,
        default: null,
    },
    mpPaymentId: {
        type: String,
        default: null,
    },
    // Google OAuth
    googleId: {
        type: String,
        sparse: true, // Allows null but unique when set
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        select: false,
    },
    // Email verification
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        select: false,
    },
    emailVerificationExpires: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true,
});

// Hash password and Encrypt PII before saving
userSchema.pre('save', async function () {
    // 1. Hash Password
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // 2. Encrypt Phone (PII)
    if (this.isModified('phone') && this.phone) {
        // Only Encrypt if it looks like clear text (not already iv:content)
        if (!this.phone.includes(':')) {
            this.phone = encrypt(this.phone);
        }
    }
});

// Decrypt PII on find
// Decrypt PII on find
// Decryption hooks disabled due to Mongoose compatibility issue

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ storeId: 1 });

// Export model
export const User = mongoose.model<IUser>('User', userSchema);

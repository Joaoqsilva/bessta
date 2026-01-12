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
    phone: string;
    role: 'store_owner' | 'admin_master' | 'client_user';
    storeId?: mongoose.Types.ObjectId;
    isActive: boolean;
    plan: 'free' | 'basic' | 'pro';
    planExpiresAt?: Date | null;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
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
        enum: ['free', 'basic', 'pro'],
        default: 'free',
    },
    planExpiresAt: {
        type: Date,
        default: null,
    },
    stripeCustomerId: {
        type: String,
        default: null,
    },
    stripeSubscriptionId: {
        type: String,
        default: null,
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

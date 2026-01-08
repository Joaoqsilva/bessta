// ========================================
// STORE MODEL
// MongoDB Schema for Stores
// ========================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
    _id: mongoose.Types.ObjectId;
    slug: string;
    name: string;
    description: string;
    category: string;
    address: string;
    phone: string;
    email: string;
    ownerId: mongoose.Types.ObjectId;
    ownerName: string;
    rating: number;
    totalReviews: number;
    status: 'active' | 'pending' | 'suspended';
    plan: 'free' | 'basic' | 'pro';
    // Custom domain fields
    customDomain?: string;
    domainVerified: boolean;
    domainVerificationCode?: string;
    // Working hours
    workingHours: {
        dayOfWeek: number;
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const workingHourSchema = new Schema({
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    isOpen: { type: Boolean, default: false },
    openTime: { type: String, default: '' },
    closeTime: { type: String, default: '' },
}, { _id: false });

const storeSchema = new Schema<IStore>({
    slug: {
        type: String,
        required: [true, 'Slug é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'],
    },
    name: {
        type: String,
        required: [true, 'Nome da loja é obrigatório'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        default: 'other',
    },
    address: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        lowercase: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ownerName: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended'],
        default: 'active',
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'pro'],
        default: 'free',
    },
    // Custom domain
    customDomain: {
        type: String,
        unique: true,
        sparse: true, // Allow null values
        lowercase: true,
        trim: true,
    },
    domainVerified: {
        type: Boolean,
        default: false,
    },
    domainVerificationCode: {
        type: String,
    },
    // Working hours
    workingHours: {
        type: [workingHourSchema],
        default: [
            { dayOfWeek: 0, isOpen: false, openTime: '', closeTime: '' },
            { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' },
        ],
    },
}, {
    timestamps: true,
});

// Indexes
storeSchema.index({ slug: 1 });
storeSchema.index({ ownerId: 1 });
storeSchema.index({ customDomain: 1 });
storeSchema.index({ status: 1 });

export const Store = mongoose.model<IStore>('Store', storeSchema);

// ========================================
// DOMAIN MODEL
// MongoDB Schema for Custom Domains
// ========================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IDomain extends Document {
    _id: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    domain: string;
    verified: boolean;
    verificationCode: string;
    vercelDomainId?: string;
    sslStatus: 'pending' | 'active' | 'failed';
    dnsStatus: 'pending' | 'configured' | 'failed';
    lastCheckAt?: Date;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const domainSchema = new Schema<IDomain>({
    storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        unique: true, // One domain per store
    },
    domain: {
        type: String,
        required: [true, 'Domínio é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
            'Formato de domínio inválido'
        ],
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        required: true,
    },
    vercelDomainId: {
        type: String,
    },
    sslStatus: {
        type: String,
        enum: ['pending', 'active', 'failed'],
        default: 'pending',
    },
    dnsStatus: {
        type: String,
        enum: ['pending', 'configured', 'failed'],
        default: 'pending',
    },
    lastCheckAt: {
        type: Date,
    },
    verifiedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes
domainSchema.index({ domain: 1 });
domainSchema.index({ storeId: 1 });
domainSchema.index({ verified: 1 });

export const Domain = mongoose.model<IDomain>('Domain', domainSchema);

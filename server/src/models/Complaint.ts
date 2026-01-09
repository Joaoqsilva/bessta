// ========================================
// COMPLAINT MODEL
// User complaints about stores/services
// ========================================

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComplaint extends Document {
    title: string;
    description: string;
    type: 'service' | 'store' | 'payment' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    // Complainant info
    complainantId?: Types.ObjectId;
    complainantName: string;
    complainantEmail: string;
    // Target
    targetStoreId?: Types.ObjectId;
    targetStoreName?: string;
    // Resolution
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: Types.ObjectId;
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['service', 'store', 'payment', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'dismissed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    complainantId: { type: Schema.Types.ObjectId, ref: 'User' },
    complainantName: { type: String, required: true },
    complainantEmail: { type: String, required: true },
    targetStoreId: { type: Schema.Types.ObjectId, ref: 'Store' },
    targetStoreName: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

// Indexes
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ targetStoreId: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

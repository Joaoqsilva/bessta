// ========================================
// SUPPORT TICKET MODEL
// Support requests from users
// ========================================

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITicketResponse {
    message: string;
    responderId: Types.ObjectId;
    responderName: string;
    isStaff: boolean;
    createdAt: Date;
}

export interface ISupportTicket extends Document {
    subject: string;
    message: string;
    category: 'billing' | 'technical' | 'account' | 'feature' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
    // User info
    userId?: Types.ObjectId;
    userName: string;
    userEmail: string;
    // Store info (optional)
    storeId?: Types.ObjectId;
    storeName?: string;
    // Responses
    responses: ITicketResponse[];
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

const TicketResponseSchema = new Schema<ITicketResponse>({
    message: { type: String, required: true },
    responderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responderName: { type: String, required: true },
    isStaff: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const SupportTicketSchema = new Schema<ISupportTicket>({
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
        type: String,
        enum: ['billing', 'technical', 'account', 'feature', 'other'],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'],
        default: 'open'
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
    storeName: { type: String },
    responses: [TicketResponseSchema],
}, {
    timestamps: true
});

// Indexes
SupportTicketSchema.index({ status: 1, createdAt: -1 });
SupportTicketSchema.index({ userId: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);

// ========================================
// REVIEW MODEL
// Store reviews from customers
// ========================================

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
    storeId: Types.ObjectId;
    // Reviewer info
    customerName: string;
    customerEmail?: string;
    // Review content
    rating: number; // 1-5
    comment: string;
    // Moderation
    isApproved: boolean;
    isVisible: boolean;
    // Response from store owner
    ownerResponse?: string;
    ownerResponseAt?: Date;
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    ownerResponse: { type: String },
    ownerResponseAt: { type: Date },
}, {
    timestamps: true
});

// Indexes
ReviewSchema.index({ storeId: 1, createdAt: -1 });
ReviewSchema.index({ storeId: 1, isVisible: 1 });

// Virtual for calculating average rating (to be used in aggregation)
ReviewSchema.statics.getAverageRating = async function (storeId: Types.ObjectId) {
    const result = await this.aggregate([
        { $match: { storeId, isVisible: true } },
        { $group: { _id: '$storeId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    return result[0] || { avgRating: 0, count: 0 };
};

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

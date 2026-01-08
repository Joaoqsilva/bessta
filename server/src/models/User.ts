// ========================================
// USER MODEL
// MongoDB Schema for Users
// ========================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for User document
export interface IUser {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    ownerName: string;
    phone: string;
    role: 'store_owner' | 'admin_master';
    storeId?: mongoose.Types.ObjectId;
    isActive: boolean;
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
        enum: ['store_owner', 'admin_master'],
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
}, {
    timestamps: true,
});

// Hash password before saving - use function expression
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ storeId: 1 });

// Export model
export const User = mongoose.model<IUser>('User', userSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
    storeId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    duration: number; // in minutes
    durationDisplay: string;
    price: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
    storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Nome do serviço é obrigatório'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    duration: {
        type: Number,
        required: true,
        min: 0,
    },
    durationDisplay: {
        type: String,
        default: '30 min',
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'BRL',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Indexes
serviceSchema.index({ storeId: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);

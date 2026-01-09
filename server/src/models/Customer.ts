import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
    storeId: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    totalVisits: number;
    lastVisit?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
    storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Nome do cliente é obrigatório'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Telefone do cliente é obrigatório'],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    notes: {
        type: String,
        default: '',
    },
    totalVisits: {
        type: Number,
        default: 0,
    },
    lastVisit: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes
customerSchema.index({ storeId: 1, phone: 1 }); // Phone unique per store? Or just indexed? 
// Let's keep it non-unique for now per store unless we want to enforce it. 
// A user might duplicate a contact.
customerSchema.index({ storeId: 1, name: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

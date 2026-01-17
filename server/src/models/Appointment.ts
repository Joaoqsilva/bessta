import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
    storeId: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId; // Optional link to registered customer
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: mongoose.Types.ObjectId;
    serviceName: string; // Snapshot of service name
    servicePrice: number; // Snapshot of price
    date: Date; // Start time
    endDate: Date; // End time
    duration: number; // Duration in minutes
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    reminderSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
    storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
    },
    customerName: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    serviceName: {
        type: String,
        required: true,
    },
    servicePrice: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending', // All new appointments start as pending
    },
    notes: {
        type: String,
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Indexes
appointmentSchema.index({ storeId: 1, date: 1 }); // Important for calendar view
appointmentSchema.index({ customerId: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

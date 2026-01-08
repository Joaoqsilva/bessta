// ========================================
// DATABASE CONNECTION
// MongoDB with Mongoose
// ========================================

import mongoose from 'mongoose';

// Connection options
const options: mongoose.ConnectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
};

// Track connection state
let isConnected = false;

/**
 * Connect to MongoDB
 */
export async function connectDB(): Promise<void> {
    if (isConnected) {
        console.log('📦 Using existing MongoDB connection');
        return;
    }

    // Get URI at connection time (after dotenv loaded)
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bessta';

    console.log('🔄 Connecting to MongoDB...');
    console.log('   URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

    try {
        const db = await mongoose.connect(MONGODB_URI, options);
        isConnected = db.connections[0].readyState === 1;
        console.log('✅ MongoDB connected successfully');
        console.log('   Database:', db.connection.name);
    } catch (error: any) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('   Full error:', error);
        throw error; // Re-throw to prevent server from starting with broken DB
    }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('🔌 MongoDB disconnected');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
    isConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
    isConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
    isConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
});

export default mongoose;

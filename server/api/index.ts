import { connectDB } from '../src/config/database';
import app from '../src/app';

// Cache the database connection
let isConnected = false;

export default async function handler(req: any, res: any) {
    if (!isConnected) {
        try {
            await connectDB();
            isConnected = true;
            console.log('✅ Connected to MongoDB (Serverless)');
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            return res.status(500).json({ error: 'Database connection failed' });
        }
    }

    return app(req, res);
}

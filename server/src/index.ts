import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { connectDB } from './config/database';
import app from './app';

const PORT = process.env.PORT || 3001;

async function startServer() {
    // 1. Start HTTP Server immediately
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 BOOKME API SERVER                       ║
╠══════════════════════════════════════════════════════════════╣
║  Server:      http://localhost:${PORT}                          ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(45)}║
║  Status:      Waiting for DB...                              ║
╚══════════════════════════════════════════════════════════════╝
        `);
    });

    // 2. Connect to MongoDB in background
    try {
        await connectDB();
        console.log('✅ Database is ready and accepting requests');

        // Start Cron Jobs
        const { startReminderJob } = require('./cron/reminderJob');
        startReminderJob();

        // Seed Admin User if not exists
        const { User } = require('./models/User');
        // Simple retry logic or just run once
        try {
            // We can dynamically import or just use require for this seed logic to avoid top-level dependency issues
            // before DB is ready, although models are safe to import.
            const adminEmail = 'admin@master.com';
            const adminExists = await User.findOne({ email: adminEmail });

            if (!adminExists) {
                console.log('Creating default Admin Master user...');
                const adminUser = new User({
                    email: adminEmail,
                    password: 'admin123', // Will be hashed by pre-save
                    ownerName: 'Master Admin',
                    phone: '99999999999',
                    role: 'admin_master',
                    plan: 'professional'
                });
                await adminUser.save();
                console.log('✅ Default Admin created: admin@master.com / admin123');
            } else {
                console.log('ℹ️ Admin user already exists: admin@master.com');
            }
        } catch (seedError) {
            console.error('Failed to seed admin user:', seedError);
        }

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

import dotenv from 'dotenv';
dotenv.config();
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

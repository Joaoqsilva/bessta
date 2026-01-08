// ========================================
// BESSTA API SERVER
// Production-ready with MongoDB & JWT
// ========================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import domainRoutes from './routes/domains';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (for Railway/Vercel)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// Flag to track database status
let isDbReady = false;

// Health check (public)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        dbStatus: isDbReady ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Middleware to check DB connection for API routes
app.use('/api', (req, res, next) => {
    if (!isDbReady) {
        return res.status(503).json({
            success: false,
            error: 'Serviço em inicialização ou banco de dados indisponível'
        });
    }
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado'
    });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        return res.status(400).json({
            success: false,
            error: messages.join(', ')
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Este registro já existe'
        });
    }

    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : err.message
    });
});

// Start server function
async function startServer() {
    // 1. Start HTTP Server immediately
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 BESSTA API SERVER                       ║
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
        isDbReady = true;
        console.log('✅ Database is ready and accepting requests');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        // We don't exit process so logs can be read in Railway
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

// Start the server
startServer();

export default app;

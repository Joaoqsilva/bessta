import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import domainRoutes from './routes/domains';
import storeRoutes from './routes/store';
import serviceRoutes from './routes/services';
import appointmentRoutes from './routes/appointments';
import paymentRoutes from './routes/payments';
import platformRoutes from './routes/platform';
import complaintRoutes from './routes/complaints';
import supportRoutes from './routes/support';
import reviewRoutes from './routes/reviews';
import customerRoutes from './routes/customers';
import notificationRoutes from './routes/notifications';
import securityRoutes from './routes/security';

// Security packages
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize'; // Replaced by safeMongoSanitize
import hpp from 'hpp';

const app = express();

// Trust proxy (for Railway/Vercel)
app.set('trust proxy', 1);

import { honeypot } from './middleware/honeypot';

import { safeMongoSanitize } from './middleware/security';

// Security Middleware
app.use(honeypot); // Active Defense (First line of defense)
app.use(helmet());
app.use(safeMongoSanitize); // NoSQL injection protection (Custom Express 5 compatible)
// app.use(hpp()); // Prevent parameter pollution - TEMPORARILY DISABLED
// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api', limiter); // Global rate limiting enabled

// CORS Configuration - Secure but flexible
const allowedOrigins = [
    // Development
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    // Production (Vercel)
    'https://bessta-booking.vercel.app',
    'https://bessta-app.vercel.app',
    // Add custom domains from environment if needed
    ...(process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [])
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, server-to-server)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any *.vercel.app subdomain (for preview deployments)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Block other origins
        console.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // Cache preflight for 24 hours
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// Health check (public) - Updated to just return ok, DB check is separate
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// CSRF Token endpoint
import { getCsrfTokenEndpoint } from './middleware/csrf';
app.get('/api/csrf-token', getCsrfTokenEndpoint);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security', securityRoutes);

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

export default app;

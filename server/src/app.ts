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

const app = express();

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

// Health check (public) - Updated to just return ok, DB check is separate
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

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

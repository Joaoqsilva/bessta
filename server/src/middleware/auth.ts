// ========================================
// JWT AUTHENTICATION MIDDLEWARE
// ========================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'bessta-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Extended Request with user
export interface AuthRequest extends Request {
    user?: IUser;
    userId?: string;
}

// JWT Payload interface
interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

/**
 * Generate JWT token
 */
export function generateToken(user: IUser): string {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Authentication middleware
 * Requires valid JWT token in Authorization header
 */
export async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticação não fornecido'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido ou expirado'
            });
        }

        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não encontrado ou inativo'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro de autenticação'
        });
    }
}

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require it
 */
export async function optionalAuthMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);

            if (decoded) {
                const user = await User.findById(decoded.userId);
                if (user && user.isActive) {
                    req.user = user;
                    req.userId = decoded.userId;
                }
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
}

/**
 * Admin only middleware
 * Requires user to be admin_master
 */
export async function adminMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    if (!req.user || req.user.role !== 'admin_master') {
        return res.status(403).json({
            success: false,
            error: 'Acesso negado. Permissão de administrador necessária.'
        });
    }

    next();
}

/**
 * Store owner middleware
 * Requires user to own the store or be admin
 */
export function storeOwnerMiddleware(storeIdParam: string = 'storeId') {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const storeId = req.params[storeIdParam] || req.body[storeIdParam];

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Autenticação necessária'
            });
        }

        // Admin can access all stores
        if (req.user.role === 'admin_master') {
            return next();
        }

        // Check if user owns the store
        if (req.user.storeId?.toString() !== storeId) {
            return res.status(403).json({
                success: false,
                error: 'Acesso negado. Você não é dono desta loja.'
            });
        }

        next();
    };
}

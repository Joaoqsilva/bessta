// ========================================
// CSRF PROTECTION MIDDLEWARE
// Token-based CSRF protection for forms
// ========================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Store CSRF tokens in memory (use Redis in production for scalability)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Configuration
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // Cleanup every 10 minutes

// Cleanup expired tokens periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of csrfTokens.entries()) {
        if (data.expires < now) {
            csrfTokens.delete(sessionId);
        }
    }
}, CLEANUP_INTERVAL_MS);

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(sessionId, {
        token,
        expires: Date.now() + TOKEN_EXPIRY_MS
    });
    return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
    const stored = csrfTokens.get(sessionId);
    if (!stored) return false;

    // Check expiry
    if (stored.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(stored.token),
        Buffer.from(token)
    );
}

/**
 * Remove CSRF token (after use or logout)
 */
export function removeCsrfToken(sessionId: string): void {
    csrfTokens.delete(sessionId);
}

/**
 * CSRF Protection Middleware
 * Validates CSRF token on state-changing requests (POST, PUT, DELETE, PATCH)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
    // Skip safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // Skip if explicitly allowed (for APIs used by external clients)
    // These should still be protected by other means (auth, rate limiting)
    const skipPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/payments/webhook', // Stripe webhook has its own signature verification
        '/api/appointments', // Public appointment creation
        '/api/reviews', // Public review creation
        '/api/complaints', // Public complaint creation
        '/api/support/public' // Public support ticket
    ];

    if (skipPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    // Get token from header or body
    const token = req.headers['x-csrf-token'] as string || req.body?._csrf;

    if (!token) {
        // For now, just log and allow (gradual rollout)
        // In production, return 403
        console.warn(`⚠️ CSRF token missing for ${req.method} ${req.path}`);
        return next();
        // return res.status(403).json({ error: 'CSRF token missing' });
    }

    // Get session ID from JWT or cookie
    const authHeader = req.headers.authorization;
    const sessionId = authHeader ? authHeader.substring(7, 39) : 'anonymous';

    if (!validateCsrfToken(sessionId, token)) {
        console.warn(`⚠️ Invalid CSRF token for ${req.method} ${req.path}`);
        return next();
        // return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
}

/**
 * Endpoint to get a new CSRF token
 */
export function getCsrfTokenEndpoint(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const sessionId = authHeader ? authHeader.substring(7, 39) : crypto.randomBytes(16).toString('hex');

    const token = generateCsrfToken(sessionId);
    res.json({ csrfToken: token });
}

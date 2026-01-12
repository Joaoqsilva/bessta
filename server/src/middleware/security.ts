// ========================================
// SECURITY MIDDLEWARE
// Custom implementations for Express 5 compatibility
// ========================================

import { Request, Response, NextFunction } from 'express';

/**
 * Recursively remove keys starting with '$' from object/array
 * Modifies object in-place to avoid "Cannot set property" errors in Express 5
 */
function clean(data: any) {
    if (data instanceof Array) {
        for (let i = 0; i < data.length; i++) {
            clean(data[i]);
        }
    } else if (data && typeof data === 'object') {
        for (const key in data) {
            if (key.startsWith('$')) {
                delete data[key];
            } else {
                clean(data[key]);
            }
        }
    }
}

/**
 * Middleware to sanitize inputs against NoSQL Injection
 * Replaces express-mongo-sanitize which is incompatible with Express 5
 */
export function safeMongoSanitize(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.body) clean(req.body);
        if (req.params) clean(req.params);
        if (req.query) clean(req.query);
    } catch (error) {
        console.error('Sanitization error:', error);
        // Don't block request on error, just log
    }
    next();
}

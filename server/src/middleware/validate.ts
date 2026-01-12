import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory for Zod validation
 * Validates request against a schema (body, query, params)
 */
export const validate = (schema: ZodSchema) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Parse request against schema
        // stripUnknown is default in Zod unless .strict() is used, preventing mass assignment if schema is partial
        // But we usually validate specific parts: { body: ... }
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            // Return formatted error (compatible with Zod v4)
            const issues = error.issues || [];
            const messages = issues.map((e: { message?: string }) => e.message || 'Erro de validação').join(', ');
            return res.status(400).json({
                success: false,
                error: messages || 'Dados inválidos',
                details: issues
            });
        }
        return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }
};

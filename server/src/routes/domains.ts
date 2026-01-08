// ========================================
// DOMAIN ROUTES
// API endpoints for domain management
// ========================================

import { Router, Response } from 'express';
import * as domainService from '../services/domainService';
import * as vercelService from '../services/vercelService';
import { authMiddleware, storeOwnerMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/domains
 * Add a new custom domain for a store
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { storeId, domain } = req.body;
        const user = req.user!;

        // Use user's store if not specified
        const targetStoreId = storeId || user.storeId?.toString();

        if (!targetStoreId) {
            return res.status(400).json({
                success: false,
                error: 'storeId é obrigatório'
            });
        }

        // Check permission
        if (user.role !== 'admin_master' && user.storeId?.toString() !== targetStoreId) {
            return res.status(403).json({
                success: false,
                error: 'Você não tem permissão para modificar esta loja'
            });
        }

        if (!domain) {
            return res.status(400).json({
                success: false,
                error: 'Domínio é obrigatório'
            });
        }

        // Validate domain format
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        const normalizedDomain = domain
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '')
            .trim();

        if (!domainRegex.test(normalizedDomain)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de domínio inválido'
            });
        }

        // Add domain to our system
        const domainRecord = await domainService.addDomain(targetStoreId, normalizedDomain);

        // Try to add to Vercel (optional)
        const vercelResult = await vercelService.addDomainToVercel(normalizedDomain);

        res.status(201).json({
            success: true,
            domain: {
                id: domainRecord._id,
                storeId: domainRecord.storeId,
                domain: domainRecord.domain,
                verified: domainRecord.verified,
                dnsStatus: domainRecord.dnsStatus,
                sslStatus: domainRecord.sslStatus,
                createdAt: domainRecord.createdAt,
            },
            vercel: vercelResult.success ? 'configured' : 'manual',
            dnsInstructions: {
                type: 'CNAME',
                name: '@',
                value: 'cname.vercel-dns.com',
                note: 'A propagação do DNS pode levar até 48 horas.'
            }
        });
    } catch (error: any) {
        console.error('Error adding domain:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/domains/store/:storeId
 * Get domain for a specific store
 */
router.get('/store/:storeId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const user = req.user!;

        // Check permission
        if (user.role !== 'admin_master' && user.storeId?.toString() !== storeId) {
            return res.status(403).json({
                success: false,
                error: 'Você não tem permissão para ver esta loja'
            });
        }

        const domain = await domainService.getDomainByStoreId(storeId);

        if (!domain) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum domínio configurado para esta loja'
            });
        }

        res.json({
            success: true,
            domain: {
                id: domain._id,
                storeId: domain.storeId,
                domain: domain.domain,
                verified: domain.verified,
                dnsStatus: domain.dnsStatus,
                sslStatus: domain.sslStatus,
                lastCheckAt: domain.lastCheckAt,
                verifiedAt: domain.verifiedAt,
                createdAt: domain.createdAt,
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/domains/lookup/:domain
 * Lookup store by domain (public - for routing middleware)
 */
router.get('/lookup/:domain', async (req: AuthRequest, res: Response) => {
    try {
        const { domain } = req.params;
        const store = await domainService.getStoreByDomain(domain);

        if (!store) {
            return res.status(404).json({
                success: false,
                error: 'Domínio não encontrado ou não verificado'
            });
        }

        res.json({
            success: true,
            storeId: store._id,
            slug: store.slug,
            storeName: store.name,
            verified: true
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/domains/:domainId/verify
 * Verify DNS configuration for a domain
 */
router.post('/:domainId/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { domainId } = req.params;

        // Verify DNS (CNAME check)
        const dnsResult = await domainService.verifyDNS(domainId);

        if (!dnsResult.success) {
            return res.json({
                success: false,
                verified: false,
                message: dnsResult.message,
                cnames: dnsResult.cnames
            });
        }

        res.json({
            success: true,
            verified: true,
            message: dnsResult.message,
            cnames: dnsResult.cnames
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/domains/:domainId
 * Remove a custom domain
 */
router.delete('/:domainId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { domainId } = req.params;

        // Delete from our system
        const deleted = await domainService.deleteDomain(domainId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Domínio não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Domínio removido com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/domains/check-dns/:domain
 * Quick DNS check (public)
 */
router.get('/check-dns/:domain', async (req: AuthRequest, res: Response) => {
    try {
        const { domain } = req.params;
        const result = await domainService.checkDNS(domain);

        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/domains (admin only)
 * List all domains
 */
router.get('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const domains = await domainService.getAllDomains();
        res.json({
            success: true,
            domains,
            count: domains.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;

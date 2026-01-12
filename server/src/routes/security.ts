// ========================================
// SECURITY ADMIN ROUTES
// Admin-only routes for security management
// ========================================

import express from 'express';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import AuditLogService, { AuditLog } from '../services/AuditLogService';
import AccountLockoutService, { LoginAttempt } from '../services/AccountLockoutService';

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/security/audit-logs
 * Get recent audit logs
 */
router.get('/audit-logs', async (req: AuthRequest, res) => {
    try {
        const {
            action,
            severity,
            userId,
            page = 1,
            limit = 50
        } = req.query;

        const filter: any = {};
        if (action) filter.action = action;
        if (severity) filter.severity = severity;
        if (userId) filter.userId = userId;

        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await AuditLog.countDocuments(filter);

        res.json({
            success: true,
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar logs de auditoria' });
    }
});

/**
 * GET /api/security/security-events
 * Get recent security-related events (failed logins, lockouts, alerts)
 */
router.get('/security-events', async (req: AuthRequest, res) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const events = await AuditLogService.getRecentSecurityEvents(limit);

        res.json({
            success: true,
            events,
            count: events.length
        });
    } catch (error: any) {
        console.error('Error fetching security events:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar eventos de segurança' });
    }
});

/**
 * GET /api/security/locked-accounts
 * Get all currently locked accounts
 */
router.get('/locked-accounts', async (req: AuthRequest, res) => {
    try {
        const lockedAccounts = await AccountLockoutService.getLockedAccounts();

        res.json({
            success: true,
            accounts: lockedAccounts,
            count: lockedAccounts.length
        });
    } catch (error: any) {
        console.error('Error fetching locked accounts:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar contas bloqueadas' });
    }
});

/**
 * POST /api/security/unlock-account
 * Manually unlock an account
 */
router.post('/unlock-account', async (req: AuthRequest, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email é obrigatório' });
        }

        const unlocked = await AccountLockoutService.unlockAccount(email);

        if (unlocked) {
            // Log admin action
            const ip = req.ip || 'unknown';
            await AuditLogService.log({
                userId: req.user?._id?.toString(),
                action: 'ADMIN_ACTION',
                details: { action: 'unlock_account', targetEmail: email },
                ip,
                severity: 'info'
            });
        }

        res.json({
            success: unlocked,
            message: unlocked ? 'Conta desbloqueada com sucesso' : 'Conta não encontrada ou não estava bloqueada'
        });
    } catch (error: any) {
        console.error('Error unlocking account:', error);
        res.status(500).json({ success: false, error: 'Erro ao desbloquear conta' });
    }
});

/**
 * GET /api/security/account-status/:email
 * Get account lockout status
 */
router.get('/account-status/:email', async (req: AuthRequest, res) => {
    try {
        const { email } = req.params;
        const status = await AccountLockoutService.getAccountStatus(email);

        res.json({
            success: true,
            ...status
        });
    } catch (error: any) {
        console.error('Error fetching account status:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar status da conta' });
    }
});

/**
 * GET /api/security/user-logs/:userId
 * Get audit logs for a specific user
 */
router.get('/user-logs/:userId', async (req: AuthRequest, res) => {
    try {
        const { userId } = req.params;
        const limit = Number(req.query.limit) || 50;

        const logs = await AuditLogService.getLogsForUser(userId, limit);

        res.json({
            success: true,
            logs,
            count: logs.length
        });
    } catch (error: any) {
        console.error('Error fetching user logs:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar logs do usuário' });
    }
});

/**
 * GET /api/security/stats
 * Get security statistics
 */
router.get('/stats', async (req: AuthRequest, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            failedLogins24h,
            failedLogins7d,
            lockedAccountsCount,
            securityAlerts24h,
            totalLogins24h
        ] = await Promise.all([
            AuditLog.countDocuments({ action: 'LOGIN_FAILED', createdAt: { $gte: last24h } }),
            AuditLog.countDocuments({ action: 'LOGIN_FAILED', createdAt: { $gte: last7d } }),
            LoginAttempt.countDocuments({ lockedUntil: { $gt: now } }),
            AuditLog.countDocuments({ action: 'SECURITY_ALERT', createdAt: { $gte: last24h } }),
            AuditLog.countDocuments({ action: 'LOGIN_SUCCESS', createdAt: { $gte: last24h } })
        ]);

        res.json({
            success: true,
            stats: {
                failedLogins24h,
                failedLogins7d,
                lockedAccountsCount,
                securityAlerts24h,
                totalLogins24h,
                loginFailureRate24h: totalLogins24h > 0
                    ? Math.round((failedLogins24h / (failedLogins24h + totalLogins24h)) * 100)
                    : 0
            }
        });
    } catch (error: any) {
        console.error('Error fetching security stats:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar estatísticas de segurança' });
    }
});

export default router;

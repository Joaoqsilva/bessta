// ========================================
// AUDIT LOG SERVICE
// Security event logging for compliance
// ========================================

import mongoose from 'mongoose';

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'REGISTER',
            'PASSWORD_CHANGE',
            'PASSWORD_RESET_REQUEST',
            'ACCOUNT_LOCKED',
            'ACCOUNT_UNLOCKED',
            'PROFILE_UPDATE',
            'STORE_CREATE',
            'STORE_UPDATE',
            'STORE_DELETE',
            'PAYMENT_SUCCESS',
            'PAYMENT_FAILED',
            'SUBSCRIPTION_CREATED',
            'SUBSCRIPTION_CANCELLED',
            'ADMIN_ACTION',
            'SECURITY_ALERT'
        ]
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    },
    success: {
        type: Boolean,
        default: true
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'error', 'critical'],
        default: 'info'
    }
}, {
    timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// Auto-delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

interface AuditLogEntry {
    userId?: string;
    action: string;
    details?: Record<string, any>;
    ip?: string;
    userAgent?: string;
    success?: boolean;
    severity?: 'info' | 'warning' | 'error' | 'critical';
}

class AuditLogService {
    /**
     * Log a security event
     */
    static async log(entry: AuditLogEntry): Promise<void> {
        try {
            await AuditLog.create({
                userId: entry.userId ? new mongoose.Types.ObjectId(entry.userId) : undefined,
                action: entry.action,
                details: entry.details || {},
                ip: entry.ip || '',
                userAgent: entry.userAgent || '',
                success: entry.success !== undefined ? entry.success : true,
                severity: entry.severity || 'info'
            });

            // Log critical events to console for immediate visibility
            if (entry.severity === 'critical' || entry.severity === 'error') {
                console.error(`🚨 AUDIT [${entry.severity.toUpperCase()}]: ${entry.action}`, {
                    userId: entry.userId,
                    ip: entry.ip,
                    details: entry.details
                });
            }
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    /**
     * Log login success
     */
    static async loginSuccess(userId: string, ip: string, userAgent: string): Promise<void> {
        await this.log({
            userId,
            action: 'LOGIN_SUCCESS',
            ip,
            userAgent,
            severity: 'info'
        });
    }

    /**
     * Log login failure
     */
    static async loginFailed(email: string, ip: string, userAgent: string, reason: string): Promise<void> {
        await this.log({
            action: 'LOGIN_FAILED',
            details: { email, reason },
            ip,
            userAgent,
            success: false,
            severity: 'warning'
        });
    }

    /**
     * Log account lockout
     */
    static async accountLocked(userId: string, ip: string, reason: string): Promise<void> {
        await this.log({
            userId,
            action: 'ACCOUNT_LOCKED',
            details: { reason },
            ip,
            success: false,
            severity: 'critical'
        });
    }

    /**
     * Log security alert
     */
    static async securityAlert(details: Record<string, any>, ip: string): Promise<void> {
        await this.log({
            action: 'SECURITY_ALERT',
            details,
            ip,
            success: false,
            severity: 'critical'
        });
    }

    /**
     * Get logs for a user
     */
    static async getLogsForUser(userId: string, limit: number = 50): Promise<any[]> {
        return AuditLog.find({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    /**
     * Get recent security events (admin)
     */
    static async getRecentSecurityEvents(limit: number = 100): Promise<any[]> {
        return AuditLog.find({
            $or: [
                { severity: 'critical' },
                { severity: 'error' },
                { action: 'LOGIN_FAILED' },
                { action: 'ACCOUNT_LOCKED' },
                { action: 'SECURITY_ALERT' }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export default AuditLogService;
export { AuditLog };

// ========================================
// LOGIN ATTEMPT TRACKER
// Account lockout after failed attempts
// ========================================

import mongoose from 'mongoose';

// Track login attempts per email
const loginAttemptSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    },
    lockedUntil: {
        type: Date,
        default: null
    },
    ipAddresses: [{
        ip: String,
        timestamp: Date
    }]
}, {
    timestamps: true
});

// Auto-cleanup old records (after 24 hours of no attempts)
loginAttemptSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

// Configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const PROGRESSIVE_LOCKOUT = true; // Doubles lockout time on repeated lockouts

class AccountLockoutService {
    /**
     * Check if account is locked
     */
    static async isLocked(email: string): Promise<{ locked: boolean; remainingTime?: number }> {
        const attempt = await LoginAttempt.findOne({ email: email.toLowerCase() });

        if (!attempt || !attempt.lockedUntil) {
            return { locked: false };
        }

        const now = new Date();
        if (attempt.lockedUntil > now) {
            const remainingMs = attempt.lockedUntil.getTime() - now.getTime();
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return { locked: true, remainingTime: remainingMinutes };
        }

        // Lock expired, reset
        await LoginAttempt.updateOne(
            { email: email.toLowerCase() },
            { $set: { lockedUntil: null, attempts: 0 } }
        );

        return { locked: false };
    }

    /**
     * Record a failed login attempt
     * Returns true if account is now locked
     */
    static async recordFailedAttempt(email: string, ip: string): Promise<{ locked: boolean; attemptsRemaining?: number }> {
        const normalizedEmail = email.toLowerCase();

        let attempt = await LoginAttempt.findOne({ email: normalizedEmail });

        if (!attempt) {
            attempt = new LoginAttempt({
                email: normalizedEmail,
                attempts: 1,
                lastAttempt: new Date(),
                ipAddresses: [{ ip, timestamp: new Date() }]
            });
            await attempt.save();
            return { locked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS - 1 };
        }

        // Increment attempts
        attempt.attempts += 1;
        attempt.lastAttempt = new Date();
        attempt.ipAddresses.push({ ip, timestamp: new Date() });

        // Keep only last 10 IPs
        if (attempt.ipAddresses.length > 10) {
            (attempt.ipAddresses as any[]).splice(0, attempt.ipAddresses.length - 10);
        }

        // Check if should lock
        if (attempt.attempts >= MAX_FAILED_ATTEMPTS) {
            // Calculate lockout duration (progressive)
            let lockoutMinutes = LOCKOUT_DURATION_MINUTES;
            if (PROGRESSIVE_LOCKOUT) {
                // Double lockout for each previous lockout
                const previousLockouts = Math.floor(attempt.attempts / MAX_FAILED_ATTEMPTS) - 1;
                lockoutMinutes = LOCKOUT_DURATION_MINUTES * Math.pow(2, Math.min(previousLockouts, 4)); // Max 4 hours
            }

            attempt.lockedUntil = new Date(Date.now() + lockoutMinutes * 60000);
            await attempt.save();

            return { locked: true };
        }

        await attempt.save();
        return { locked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS - attempt.attempts };
    }

    /**
     * Clear failed attempts after successful login
     */
    static async clearAttempts(email: string): Promise<void> {
        await LoginAttempt.deleteOne({ email: email.toLowerCase() });
    }

    /**
     * Manually unlock an account (admin)
     */
    static async unlockAccount(email: string): Promise<boolean> {
        const result = await LoginAttempt.updateOne(
            { email: email.toLowerCase() },
            { $set: { lockedUntil: null, attempts: 0 } }
        );
        return result.modifiedCount > 0;
    }

    /**
     * Get account status for admin
     */
    static async getAccountStatus(email: string): Promise<any> {
        const attempt = await LoginAttempt.findOne({ email: email.toLowerCase() });
        if (!attempt) {
            return { exists: false };
        }

        return {
            exists: true,
            attempts: attempt.attempts,
            lastAttempt: attempt.lastAttempt,
            lockedUntil: attempt.lockedUntil,
            isLocked: attempt.lockedUntil && attempt.lockedUntil > new Date(),
            recentIPs: attempt.ipAddresses.slice(-5)
        };
    }

    /**
     * Get all locked accounts (admin)
     */
    static async getLockedAccounts(): Promise<any[]> {
        return LoginAttempt.find({
            lockedUntil: { $gt: new Date() }
        }).sort({ lockedUntil: -1 });
    }
}

export default AccountLockoutService;
export { LoginAttempt };

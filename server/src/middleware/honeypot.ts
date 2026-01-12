import { Request, Response, NextFunction } from 'express';

// In-memory ban list (In production, use Redis)
// Map<IP, BanExpirationTimestamp>
const bannedIPs = new Map<string, number>();

// Ban duration: 24 hours
const BAN_DURATION_MS = 24 * 60 * 60 * 1000;

// Trap routes - frequent targets for bots
const TRAP_ROUTES = [
    '/.env',
    '/wp-admin',
    '/wp-login.php',
    '/admin/backup',
    '/config.json',
    '/database.sql',
    '/backup.sql',
    '/console'
];

/**
 * Honeypot Middleware
 * 1. Checks if IP is banned
 * 2. Checks if request is hitting a trap route -> Bans IP
 */
export const honeypot = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // 1. Check if IP is banned
    if (bannedIPs.has(ip)) {
        const banExpiration = bannedIPs.get(ip) || 0;

        if (now < banExpiration) {
            console.warn(`⛔ Blocked request from banned IP: ${ip}`);
            // Return 403 Forbidden without explaining why
            return res.status(403).send('Forbidden');
        } else {
            // Ban expired
            bannedIPs.delete(ip);
        }
    }

    // 2. Check for Honeypot Triggers
    if (TRAP_ROUTES.some(route => req.url.includes(route))) {
        console.error(`🚨 HONEYPOT TRIGGERED! IP: ${ip} accessed ${req.url}. Banning for 24h.`);

        // Add to ban list
        bannedIPs.set(ip, now + BAN_DURATION_MS);

        return res.status(403).send('Forbidden');
    }

    next();
};

/**
 * Cleanup expired bans every hour (Memory management)
 */
setInterval(() => {
    const now = Date.now();
    for (const [ip, expiration] of bannedIPs.entries()) {
        if (now > expiration) {
            bannedIPs.delete(ip);
        }
    }
}, 60 * 60 * 1000);

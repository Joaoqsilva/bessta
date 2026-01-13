import express from 'express';
import crypto from 'crypto';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { LicenseKey } from '../models/LicenseKey';
import { User } from '../models/User';

const router = express.Router();

/**
 * Generate a random license key
 * Format: PLAN-XXXX-XXXX-XXXX
 */
const generateKeyConfig = (plan: string) => {
    const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
    const formatted = randomPart.match(/.{1,4}/g)?.join('-') || randomPart;
    return `${plan.toUpperCase()}-${formatted}`;
};

/**
 * POST /api/licenses/generate
 * Generate a new license key (Admin Master only)
 */
router.post('/generate', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { plan, count = 1, expiresAt } = req.body;

        const validPlans = ['free', 'basic', 'pro', 'start', 'professional', 'business'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({ success: false, error: 'Plano inválido' });
        }

        const keys = [];
        for (let i = 0; i < count; i++) {
            const keyString = generateKeyConfig(plan);

            const newKey = await LicenseKey.create({
                key: keyString,
                plan,
                status: 'active',
                generatedBy: (req as any).user._id,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined
            });
            keys.push(newKey);
        }

        res.json({ success: true, keys });
    } catch (error: any) {
        console.error('Error generating keys:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/licenses
 * List all license keys (Admin Master only)
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status, plan, limit = 50 } = req.query;

        const query: any = {};
        if (status) query.status = status;
        if (plan) query.plan = plan;

        const keys = await LicenseKey.find(query)
            .populate('generatedBy', 'name email')
            .populate('usedBy', 'name email storeName')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json({ success: true, keys });
    } catch (error: any) {
        console.error('Error listing keys:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/licenses/:id
 * Revoke/Delete a license key (Admin Master only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await LicenseKey.findByIdAndDelete(id);
        res.json({ success: true, message: 'Chave removida' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/licenses/activate
 * Activate a license key for the authenticated user
 */
router.post('/activate', authMiddleware, async (req, res) => {
    try {
        const { key } = req.body;
        const userId = (req as any).user._id;

        if (!key) {
            return res.status(400).json({ success: false, error: 'Chave é obrigatória' });
        }

        // Find key
        const license = await LicenseKey.findOne({ key: key.trim() }); // Case sensitive usually, but format is uppercase

        if (!license) {
            return res.status(404).json({ success: false, error: 'Chave inválida' });
        }

        if (license.status !== 'active') {
            return res.status(400).json({ success: false, error: 'Esta chave já foi utilizada ou revogada' });
        }

        if (license.expiresAt && new Date() > license.expiresAt) {
            return res.status(400).json({ success: false, error: 'Esta chave expirou' });
        }

        // Activate user plan
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

        // Update User Plan
        user.plan = license.plan;
        user.subscriptionPlan = license.plan;
        user.subscriptionStatus = 'active';

        // Expiration (30 days default for paid plans via key, or adjust as needed)
        // Usually keys give 30 days or lifetime. Let's assume 30 days for now unless it's a specific "LIFETIME" key logic which we don't have yet.
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        user.planExpiresAt = thirtyDaysFromNow;
        user.subscriptionEndDate = thirtyDaysFromNow;

        await user.save();

        // Mark key as used
        license.status = 'used';
        license.usedBy = userId;
        license.usedAt = new Date();
        await license.save();

        res.json({
            success: true,
            message: `Plano ${license.plan} ativado com sucesso!`,
            plan: user.plan,
            expiresAt: user.planExpiresAt
        });

    } catch (error: any) {
        console.error('Error activating key:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

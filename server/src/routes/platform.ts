// ========================================
// PLATFORM SETTINGS ROUTES
// Admin-only routes for platform configuration
// ========================================

import express from 'express';
import { PlatformSettings } from '../models/PlatformSettings';
import { Store } from '../models/Store';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Complaint } from '../models/Complaint';
import { SupportTicket } from '../models/SupportTicket';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/platform/settings
 * Get platform settings (public, but some fields may be restricted)
 */
router.get('/settings', async (req, res) => {
    try {
        // Use getSettings static method to ensure a document exists
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({});
        }
        res.json(settings);
    } catch (error: any) {
        console.error('Error fetching platform settings:', error);
        res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
});

/**
 * PUT /api/platform/settings
 * Update platform settings (admin only)
 */
router.put('/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Security: Explicit field assignment to prevent mass assignment attacks
        const {
            platformName,
            platformLogo,
            primaryColor,
            supportEmail,
            supportPhone,
            maintenanceMode,
            registrationEnabled,
            defaultPlan,
            maxStoresPerUser
        } = req.body;

        const allowedUpdates: any = {};
        if (platformName !== undefined) allowedUpdates.platformName = platformName;
        if (platformLogo !== undefined) allowedUpdates.platformLogo = platformLogo;
        if (primaryColor !== undefined) allowedUpdates.primaryColor = primaryColor;
        if (supportEmail !== undefined) allowedUpdates.supportEmail = supportEmail;
        if (supportPhone !== undefined) allowedUpdates.supportPhone = supportPhone;
        if (maintenanceMode !== undefined) allowedUpdates.maintenanceMode = maintenanceMode;
        if (registrationEnabled !== undefined) allowedUpdates.registrationEnabled = registrationEnabled;
        if (defaultPlan !== undefined) allowedUpdates.defaultPlan = defaultPlan;
        if (maxStoresPerUser !== undefined) allowedUpdates.maxStoresPerUser = maxStoresPerUser;

        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create(allowedUpdates);
        } else {
            Object.assign(settings, allowedUpdates);
            settings.updatedAt = new Date();
            await settings.save();
        }

        res.json(settings);
    } catch (error: any) {
        console.error('Error updating platform settings:', error);
        res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
});


/**
 * GET /api/platform/stats
 * Get platform-wide statistics (admin only)
 */
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalStores,
            activeStores,
            pendingStores,
            totalUsers,
            totalAppointments,
            appointmentsToday,
            completedAppointments,
            openComplaints,
            openSupportTickets
        ] = await Promise.all([
            Store.countDocuments(),
            Store.countDocuments({ status: 'active' }),
            Store.countDocuments({ status: 'pending' }),
            User.countDocuments({ role: 'store_owner' }), // Assuming only owners are users for now? Or all users?
            Appointment.countDocuments(),
            Appointment.countDocuments({ date: { $gte: today } }),
            Appointment.find({ status: 'completed' }, { servicePrice: 1 }),
            Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
            SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress', 'waiting_response'] } })
        ]);

        const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.servicePrice || 0), 0);
        // Note: For a real platform, revenue calculation should be more robust

        const activeStoresThisMonth = await Store.countDocuments({
            status: 'active',
            createdAt: { $gte: startOfMonth }
        });

        // Calculate plan distribution across Users
        const planDistribution = await User.aggregate([
            { $match: { role: 'store_owner' } },
            { $group: { _id: "$plan", count: { $sum: 1 } } }
        ]);

        const distributionMap = { free: 0, basic: 0, pro: 0 };
        planDistribution.forEach(item => {
            if (item._id in distributionMap) {
                (distributionMap as any)[item._id] = item.count;
            }
        });

        // Calculate average rating across all stores
        const storesWithRating = await Store.find({ rating: { $gt: 0 } }, { rating: 1 });
        const avgRating = storesWithRating.length > 0
            ? storesWithRating.reduce((sum, s) => sum + s.rating, 0) / storesWithRating.length
            : 0;

        // Get monthly stats for charts (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // 5 months back + current = 6
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyAggregation = await Appointment.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
                $project: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    status: 1,
                    servicePrice: 1
                }
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    appointments: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, "$servicePrice", 0]
                        }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Also get new stores per month
        const storesAggregation = await Store.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $project: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format for frontend
        const months = [];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const monthIdx = d.getMonth() + 1; // 1-12

            const aptStats = monthlyAggregation.find(m => m._id.year === year && m._id.month === monthIdx) || { appointments: 0, revenue: 0 };
            const storeStats = storesAggregation.find(s => s._id.year === year && s._id.month === monthIdx) || { count: 0 };

            months.push({
                month: monthNames[monthIdx - 1],
                appointments: aptStats.appointments,
                revenue: aptStats.revenue,
                newStores: storeStats.count
            });
        }

        // Calculate revenue for this month from completed appointments
        const revenueThisMonthResult = await Appointment.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$servicePrice' }
                }
            }
        ]);
        const monthlyRevenue = revenueThisMonthResult[0]?.total || 0;

        res.json({
            totalStores,
            activeStores,
            activeStoresThisMonth,
            pendingStores,
            totalUsers,
            activeUsers: totalUsers, // Simplify for now
            totalAppointments,
            appointmentsToday,
            totalRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
            revenueThisMonth: `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`,
            openComplaints,
            pendingSupport: openSupportTickets,
            openSupportTickets,
            averagePlatformRating: Number(avgRating.toFixed(1)),
            monthlyData: months,
            planDistribution: distributionMap
        });
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

/**
 * GET /api/platform/stores
 * List all stores (admin only)
 */
router.get('/stores', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search as string, 'i');
            query.$or = [
                { name: searchRegex },
                { slug: searchRegex },
                { ownerName: searchRegex },
                { email: searchRegex }
            ];
        }

        const [stores, totalStores] = await Promise.all([
            Store.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Store.countDocuments(query)
        ]);

        // Enrich stores with appointment count
        const storesWithExtraInfo = await Promise.all(stores.map(async (s: any) => {
            const appointmentCount = await Appointment.countDocuments({ storeId: s._id });
            return {
                ...s.toObject(),
                id: s._id,
                totalAppointments: appointmentCount
            };
        }));

        res.json({
            stores: storesWithExtraInfo,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalStores / limit),
                totalStores
            }
        });
    } catch (error) {
        console.error('Error listing stores:', error);
        res.status(500).json({ error: 'Erro ao listar lojas' });
    }
});

/**
 * PATCH /api/platform/stores/:id/status
 * Update store status
 */
router.patch('/stores/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'pending', 'suspended'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const store = await Store.findByIdAndUpdate(id, { status }, { new: true });
        if (!store) {
            return res.status(404).json({ error: 'Loja não encontrada' });
        }

        res.json(store);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar status da loja' });
    }
});

/**
 * DELETE /api/platform/stores/:id
 * Delete a store
 */
router.delete('/stores/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // This is a destructive operation. In a real app we might soft-delete or archive.
        // For this migration, we delete related data.

        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ error: 'Loja não encontrada' });
        }

        // Delete related data (cascade)
        await Promise.all([
            Store.findByIdAndDelete(id),
            // User.deleteOne({ _id: store.ownerId }), // Option: keep user or delete? Let's keep user for now or delete if requested
            Appointment.deleteMany({ storeId: id }),
            // Service.deleteMany({ storeId: id }),
            // Customer.deleteMany({ storeId: id }),
            // Complaint.deleteMany({ targetStoreId: id }),
            // Review.deleteMany({ storeId: id })
        ]);

        res.json({ message: 'Loja removida com sucesso' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ error: 'Erro ao excluir loja' });
    }
});

/**
 * GET /api/platform/users
 * List all users with store info
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: 'store_owner' }).lean();

        // Populate store names
        const usersWithStore = await Promise.all(users.map(async (u: any) => {
            let storeName = '';
            if (u.storeId) {
                const store = await Store.findById(u.storeId).select('name').lean();
                if (store) storeName = store.name;
            }
            return {
                ...u,
                id: u._id,
                storeName
            };
        }));

        res.json(usersWithStore);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/platform/users/:id
 * Update user info (Name, Store Name)
 */
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, storeName } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        if (name) user.ownerName = name;
        await user.save();

        if (storeName && user.storeId) {
            await Store.findByIdAndUpdate(user.storeId, { name: storeName });
        }

        res.json({ success: true, message: 'Dados atualizados com sucesso' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/platform/users/:id/password
 * Admin Master Reset Password
 */
router.put('/users/:id/password', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        user.password = password;
        await user.save();

        res.json({ success: true, message: 'Senha redefinida com sucesso' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/platform/users/:id/plan
 * Admin Master Update User Plan
 */
router.put('/users/:id/plan', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { plan, planExpiresAt } = req.body;

        const validPlans = ['free', 'basic', 'pro', 'start', 'professional', 'business'];
        if (!plan || !validPlans.includes(plan)) {
            return res.status(400).json({ error: 'Plano inválido' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        user.plan = plan;
        user.subscriptionPlan = plan;
        user.subscriptionStatus = 'active';

        if (planExpiresAt) {
            user.planExpiresAt = new Date(planExpiresAt);
            user.subscriptionEndDate = new Date(planExpiresAt);
        } else {
            // Se não for especificado, definir para 30 dias a partir de agora para planos pagos
            if (plan !== 'free' && plan !== 'start') {
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                user.planExpiresAt = thirtyDaysFromNow;
                user.subscriptionEndDate = thirtyDaysFromNow;
            } else {
                user.planExpiresAt = null;
                user.subscriptionEndDate = undefined;
            }
        }

        await user.save();

        res.json({ success: true, message: 'Plano atualizado com sucesso', plan: user.plan });
    } catch (error: any) {
        console.error('Error updating user plan:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/platform/test-email
 * Send a test email to verify email configuration (admin only)
 */
router.post('/test-email', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email é obrigatório' });
        }

        // Import sendEmail
        const { sendEmail } = require('../services/mailService');

        const subject = 'Teste de Configuração - Simpliagenda';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4f46e5;">✅ Configuração de Email Funcionando!</h2>
                <p>Este é um email de teste enviado pelo painel administrativo do Simpliagenda.</p>
                <p>Se você está recebendo esta mensagem, significa que as configurações de email estão corretas.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280;">
                    Enviado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                </p>
            </div>
        `;

        const result = await sendEmail(email, subject, html);

        if (result) {
            res.json({ success: true, message: 'Email de teste enviado com sucesso!' });
        } else {
            res.status(500).json({
                success: false,
                error: 'Falha ao enviar email. Verifique a variável BREVO_API_KEY no servidor.'
            });
        }
    } catch (error: any) {
        console.error('Error sending test email:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar email de teste: ' + error.message
        });
    }
});

export default router;

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
        const updates = req.body;

        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create(updates);
        } else {
            Object.assign(settings, updates);
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
            revenueThisMonth: 0, // Todo: calculate
            openComplaints,
            pendingSupport: openSupportTickets,
            openSupportTickets,
            averagePlatformRating: Number(avgRating.toFixed(1)),
            monthlyData: months
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
        // Todo: Add pagination
        const stores = await Store.find().sort({ createdAt: -1 });

        // Enrich with some stats if needed, or keeping it lightweight
        // For AdminMasterService compatibility we need extended data, but let's send basic first
        // Or aggregations.

        res.json(stores);
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

export default router;

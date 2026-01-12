// ========================================
// COMPLAINTS ROUTES
// User complaints management
// ========================================

import express from 'express';
import rateLimit from 'express-rate-limit';
import { Complaint } from '../models/Complaint';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import NotificationService from '../services/NotificationService';
import { User } from '../models/User';
import { Store } from '../models/Store';

const router = express.Router();

// Rate limiter for public complaint creation (prevent spam)
const complaintLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Max 5 complaints per hour per IP
    message: 'Muitas reclamações enviadas. Tente novamente mais tarde.'
});

/**
 * GET /api/complaints
 * Get all complaints (admin only)
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const complaints = await Complaint.find(filter)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Complaint.countDocuments(filter);

        res.json({
            complaints,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Erro ao buscar reclamações' });
    }
});

/**
 * POST /api/complaints
 * Create a new complaint
 */
router.post('/', complaintLimiter, async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            priority,
            complainantName,
            complainantEmail,
            targetStoreId,
            targetStoreName
        } = req.body;

        if (!title || !description || !complainantName || !complainantEmail) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        }

        const complaint = await Complaint.create({
            title,
            description,
            type: type || 'other',
            priority: priority || 'medium',
            complainantName,
            complainantEmail,
            targetStoreId,
            targetStoreName,
            status: 'open'
        });

        res.status(201).json(complaint);

        // Notify Admins about new complaint
        const admins = await User.find({ role: 'admin_master' });
        for (const admin of admins) {
            NotificationService.create(
                admin._id,
                'complaint',
                'Nova Reclamação Recebida',
                `Uma nova reclamação foi registrada contra ${targetStoreName || 'uma loja'}: ${title}`,
                `/admin/master/complaints`
            );
        }

        // Notify Store Owner if applicable
        if (targetStoreId) {
            const store = await Store.findById(targetStoreId);
            if (store && store.ownerId) {
                NotificationService.create(
                    store.ownerId,
                    'complaint',
                    'Nova Reclamação Recebida',
                    `Sua loja recebeu uma nova reclamação: ${title}. Por favor, verifique os detalhes.`,
                    `/app/settings?tab=complaints` // Assuming store owner has a complaints view or settings
                );
            }
        }
    } catch (error: any) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Erro ao criar reclamação' });
    }
});

/**
 * PUT /api/complaints/:id
 * Update complaint status/resolution (admin only)
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { status, resolution, priority } = req.body;

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ error: 'Reclamação não encontrada' });
        }

        if (status) complaint.status = status;
        if (resolution) complaint.resolution = resolution;
        if (priority) complaint.priority = priority;

        if (status === 'resolved' || status === 'dismissed') {
            complaint.resolvedAt = new Date();
            complaint.resolvedBy = req.user?._id;
        }

        await complaint.save();
        res.json(complaint);
    } catch (error: any) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ error: 'Erro ao atualizar reclamação' });
    }
});

/**
 * DELETE /api/complaints/:id
 * Delete complaint (admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findByIdAndDelete(id);
        if (!complaint) {
            return res.status(404).json({ error: 'Reclamação não encontrada' });
        }

        res.json({ message: 'Reclamação excluída com sucesso' });
    } catch (error: any) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({ error: 'Erro ao excluir reclamação' });
    }
});

export default router;

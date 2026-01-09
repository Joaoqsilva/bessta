// ========================================
// SUPPORT TICKET ROUTES
// User support requests management
// ========================================

import express from 'express';
import { SupportTicket } from '../models/SupportTicket';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/support
 * Get support tickets (admin gets all, users get their own)
 */
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;
        const user = req.user!;

        const filter: any = {};

        // Non-admins can only see their own tickets
        if (user.role !== 'admin_master') {
            filter.userId = user._id;
        }

        if (status) filter.status = status;
        if (category) filter.category = category;

        const tickets = await SupportTicket.find(filter)
            .sort({ updatedAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await SupportTicket.countDocuments(filter);

        res.json({
            tickets,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Error fetching support tickets:', error);
        res.status(500).json({ error: 'Erro ao buscar tickets de suporte' });
    }
});

/**
 * POST /api/support
 * Create a new support ticket
 */
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = req.user!;
        const { subject, message, category, priority, storeId, storeName } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios' });
        }

        const ticket = await SupportTicket.create({
            subject,
            message,
            category: category || 'other',
            priority: priority || 'medium',
            status: 'open',
            userId: user._id,
            userName: user.ownerName || user.email,
            userEmail: user.email,
            storeId,
            storeName,
            responses: []
        });

        res.status(201).json(ticket);
    } catch (error: any) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ error: 'Erro ao criar ticket de suporte' });
    }
});

/**
 * POST /api/support/public
 * Create a new support ticket (Guest)
 */
router.post('/public', async (req, res) => {
    try {
        const { subject, message, name, email, category, storeId } = req.body;

        if (!subject || !message || !name || !email) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const ticket = await SupportTicket.create({
            subject,
            message,
            category: category || 'other',
            priority: 'medium',
            status: 'open',
            userName: name,
            userEmail: email,
            storeId, // Optional link to specific store
            responses: []
        });

        res.status(201).json(ticket);
    } catch (error: any) {
        console.error('Error creating public ticket:', error);
        res.status(500).json({ error: 'Erro ao criar ticket de suporte' });
    }
});

/**
 * GET /api/support/:id
 * Get single ticket
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = req.user!;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }

        // Check access
        // If ticket has no user (guest), only admin can see/edit
        if (!ticket.userId) {
            if (user.role !== 'admin_master') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        } else if (user.role !== 'admin_master' && !ticket.userId.equals(user._id)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        res.json(ticket);
    } catch (error: any) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ error: 'Erro ao buscar ticket' });
    }
});

/**
 * PUT /api/support/:id
 * Update ticket or add response
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = req.user!;
        const { status, priority, response } = req.body;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }

        // Check access
        if (!ticket.userId) {
            if (user.role !== 'admin_master') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        } else if (user.role !== 'admin_master' && !ticket.userId.equals(user._id)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        // Only admin can change status and priority
        if (user.role === 'admin_master') {
            if (status) ticket.status = status;
            if (priority) ticket.priority = priority;
        }

        // Add response if provided
        if (response) {
            ticket.responses.push({
                message: response,
                responderId: user._id,
                responderName: user.ownerName || user.email,
                isStaff: user.role === 'admin_master',
                createdAt: new Date()
            });

            // Update status based on responder
            if (user.role === 'admin_master') {
                ticket.status = 'waiting_response';
            } else {
                ticket.status = 'open';
            }
        }

        await ticket.save();
        res.json(ticket);
    } catch (error: any) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Erro ao atualizar ticket' });
    }
});

/**
 * DELETE /api/support/:id
 * Delete ticket (admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await SupportTicket.findByIdAndDelete(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }

        res.json({ message: 'Ticket excluído com sucesso' });
    } catch (error: any) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Erro ao excluir ticket' });
    }
});

export default router;

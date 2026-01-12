import express from 'express';
import { Service } from '../models/Service';
import { Store } from '../models/Store';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// List services for a store (Public)
router.get('/store/:storeId', async (req, res) => {
    try {
        const services = await Service.find({ storeId: req.params.storeId, isActive: true });
        res.json({ success: true, services });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Service (Auth required)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { storeId, name, description, duration, price, currency } = req.body;

        // Verify ownership
        if (req.user?.role !== 'admin_master' && req.user?.storeId?.toString() !== storeId) {
            return res.status(403).json({ success: false, error: 'Sem permissão para criar serviço nesta loja' });
        }

        // Check Plan Limits (1 Service for Free/Start plan)
        const store = await Store.findById(storeId);
        if (store && (store.plan === 'start' || store.plan === 'free')) {
            const serviceCount = await Service.countDocuments({ storeId });
            if (serviceCount >= 1) {
                return res.status(403).json({
                    success: false,
                    error: 'Seu plano atual permite apenas 1 serviço. Faça upgrade para o plano Profissional para criar serviços ilimitados.',
                    code: 'PLAN_LIMIT_REACHED'
                });
            }
        }

        const newService = await Service.create({
            storeId,
            name,
            description,
            duration,
            price,
            currency
        });

        res.status(201).json({ success: true, service: newService });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Service
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
        }

        // Verify ownership
        if (req.user?.role !== 'admin_master' && req.user?.storeId?.toString() !== service.storeId.toString()) {
            return res.status(403).json({ success: false, error: 'Sem permissão para editar este serviço' });
        }

        // Security: Explicit field assignment to prevent mass assignment attacks
        const { name, description, duration, price, currency, isActive } = req.body;
        const allowedUpdates: any = {};
        if (name !== undefined) allowedUpdates.name = name;
        if (description !== undefined) allowedUpdates.description = description;
        if (duration !== undefined) allowedUpdates.duration = duration;
        if (price !== undefined) allowedUpdates.price = price;
        if (currency !== undefined) allowedUpdates.currency = currency;
        if (isActive !== undefined) allowedUpdates.isActive = isActive;

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true }
        );

        res.json({ success: true, service: updatedService });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete Service (Soft delete via isActive: false is usually better, but let's allow hard delete too)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
        }

        // Verify ownership
        if (req.user?.role !== 'admin_master' && req.user?.storeId?.toString() !== service.storeId.toString()) {
            return res.status(403).json({ success: false, error: 'Sem permissão para remover este serviço' });
        }

        await Service.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Serviço removido com sucesso' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

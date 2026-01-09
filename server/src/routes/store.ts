import express from 'express';
import { Store } from '../models/Store';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Service } from '../models/Service';
import { Review } from '../models/Review';
import { Customer } from '../models/Customer';
import { authMiddleware, storeOwnerMiddleware } from '../middleware/auth';

const router = express.Router();

// Get public store info by ID
router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id)
            .select('-ownerId -domainVerificationCode')
            .lean();

        if (!store) {
            return res.status(404).json({ success: false, error: 'Loja não encontrada' });
        }

        res.json({ success: true, store });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get public store info by Slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug })
            .select('-ownerId -domainVerificationCode')
            .lean();

        if (!store) {
            return res.status(404).json({ success: false, error: 'Loja não encontrada' });
        }

        res.json({ success: true, store });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Store Customization
router.put('/:id/customization', authMiddleware, storeOwnerMiddleware('id'), async (req, res) => {
    try {
        const { customization } = req.body;

        if (!customization) {
            return res.status(400).json({ success: false, error: 'Dados de customização inválidos' });
        }

        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { $set: { customization } },
            { new: true }
        );

        if (!store) {
            return res.status(404).json({ success: false, error: 'Loja não encontrada' });
        }

        res.json({ success: true, store });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Weekly Time Slots
router.put('/:id/weekly-slots', authMiddleware, storeOwnerMiddleware('id'), async (req, res) => {
    try {
        const { weeklyTimeSlots } = req.body;

        if (!weeklyTimeSlots || typeof weeklyTimeSlots !== 'object') {
            return res.status(400).json({ success: false, error: 'Formato de slots inválido' });
        }

        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { $set: { weeklyTimeSlots } },
            { new: true }
        );

        if (!store) {
            return res.status(404).json({ success: false, error: 'Loja não encontrada' });
        }

        res.json({ success: true, store });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Working Hours
router.put('/:id/working-hours', authMiddleware, storeOwnerMiddleware('id'), async (req, res) => {
    try {
        const { workingHours } = req.body;

        if (!Array.isArray(workingHours)) {
            return res.status(400).json({ success: false, error: 'Formato de horários inválido' });
        }

        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { $set: { workingHours } },
            { new: true }
        );

        res.json({ success: true, store });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update General Settings (Name, Description, Contact)
router.put('/:id/settings', authMiddleware, storeOwnerMiddleware('id'), async (req, res) => {
    try {
        const { name, slug, description, address, phone, email, instagram, whatsapp, facebook } = req.body;

        // Construct update object with allowed fields
        const updates: any = {};
        if (name) updates.name = name;
        if (typeof description === 'string') updates.description = description;
        if (typeof address === 'string') updates.address = address;
        if (typeof phone === 'string') updates.phone = phone;
        if (typeof email === 'string') updates.email = email;

        // Handle slug update with validation
        if (slug) {
            // Check if slug is already taken by another store
            const existingStore = await Store.findOne({ slug, _id: { $ne: req.params.id } });
            if (existingStore) {
                return res.status(400).json({ success: false, error: 'Este slug já está em uso' });
            }
            updates.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        }

        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        res.json({ success: true, store });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Update Store Status (Self-Deactivation)
router.patch('/:id/status', authMiddleware, storeOwnerMiddleware('id'), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Status inválido' });
        }

        const store = await Store.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, store });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete Store (Account Deletion)
router.delete('/:id', authMiddleware, storeOwnerMiddleware('id'), async (req, res) => {
    try {
        const { id } = req.params;
        const store = await Store.findById(id);

        if (!store) {
            return res.status(404).json({ success: false, error: 'Loja não encontrada' });
        }

        // Cascading delete
        await Promise.all([
            Store.findByIdAndDelete(id),
            User.findByIdAndDelete(store.ownerId),
            Appointment.deleteMany({ storeId: id }),
            Service.deleteMany({ storeId: id }),
            Review.deleteMany({ storeId: id }),
            Customer.deleteMany({ storeId: id })
            // We could also delete complaints, etc.
        ]);

        res.json({ success: true, message: 'Conta e dados excluídos com sucesso' });
    } catch (error: any) {
        console.error('Error deleting store:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

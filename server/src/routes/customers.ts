import express from 'express';
import { Customer } from '../models';
import { authMiddleware } from '../middleware/auth';
import { Store } from '../models';

const router = express.Router();

// Public routes (none for now)

// Protected routes
router.use(authMiddleware);

// Get all customers for a store (store owner only)
router.get('/store/:storeId', async (req: any, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?._id?.toString() || req.userId;
        const userRole = req.user.role;

        // Check ownership
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Loja não encontrada' });
        }

        if (store.ownerId.toString() !== userId && userRole !== 'admin_master') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const customers = await Customer.find({ storeId }).sort({ name: 1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

// Create a new customer
router.post('/store/:storeId', async (req: any, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?._id?.toString() || req.userId;
        const userRole = req.user.role;
        const customerData = req.body;

        // Check ownership
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Loja não encontrada' });
        }

        if (store.ownerId.toString() !== userId && userRole !== 'admin_master') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const customer = new Customer({
            ...customerData,
            storeId
        });

        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar cliente' });
    }
});

// Update a customer
router.put('/:id', async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id?.toString() || req.userId; // Fixed: use correct property
        const userRole = req.user?.role;

        // Security: Explicit field assignment to prevent mass assignment attacks
        const { name, email, phone, notes } = req.body;

        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        // Check ownership of the store this customer belongs to
        const store = await Store.findById(customer.storeId);
        if (!store || (store.ownerId.toString() !== userId && userRole !== 'admin_master')) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        // Only allow updating specific fields (prevent storeId manipulation)
        const allowedUpdates: any = {};
        if (name !== undefined) allowedUpdates.name = name;
        if (email !== undefined) allowedUpdates.email = email;
        if (phone !== undefined) allowedUpdates.phone = phone;
        if (notes !== undefined) allowedUpdates.notes = notes;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );

        res.json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar cliente' });
    }
});

// Delete a customer
router.delete('/:id', async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id?.toString() || req.userId;
        const userRole = req.user?.role;

        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        // Check ownership
        const store = await Store.findById(customer.storeId);
        if (!store || (store.ownerId.toString() !== userId && userRole !== 'admin_master')) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await customer.deleteOne();
        res.json({ message: 'Cliente removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover cliente' });
    }
});

export default router;

import express from 'express';
import { Appointment } from '../models/Appointment';
import { Service } from '../models/Service';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Store } from '../models/Store';
import { User } from '../models/User';

const router = express.Router();

// List appointments for a store (Store Owner only)
router.get('/store/:storeId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { storeId } = req.params;
        const { date, status } = req.query; // Filters

        // Verify ownership
        if (req.user?.role !== 'admin_master' && req.user?.storeId?.toString() !== storeId) {
            return res.status(403).json({ success: false, error: 'Sem permissão para ver agendamentos desta loja' });
        }

        const query: any = { storeId };

        // Filter by date (simple day match)
        if (date) {
            const startDate = new Date(date as string);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date as string);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query).sort({ date: 1 });
        res.json({ success: true, appointments });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Appointment (Public)
router.post('/', async (req, res) => {
    try {
        const {
            storeId,
            serviceId,
            date,
            customerName,
            customerPhone,
            customerEmail,
            notes
        } = req.body;

        // Validation
        const store = await Store.findById(storeId);
        if (!store) return res.status(404).json({ success: false, error: 'Loja não encontrada' });

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });

        // Calculate end date
        const startDate = new Date(date);
        const endDate = new Date(startDate.getTime() + service.duration * 60000);

        // Check availability (Basic check - no overlap)
        const conflict = await Appointment.findOne({
            storeId,
            status: { $ne: 'cancelled' },
            $or: [
                { date: { $lt: endDate }, endDate: { $gt: startDate } }
            ]
        });

        if (conflict) {
            return res.status(409).json({ success: false, error: 'Horário indisponível' });
        }

        // Create appointment
        const appointment = await Appointment.create({
            storeId,
            serviceId,
            serviceName: service.name,
            servicePrice: service.price,
            date: startDate,
            endDate,
            duration: service.duration,
            customerName,
            customerPhone,
            customerEmail,
            notes,
            status: 'confirmed' // Auto-confirm for now
        });

        res.status(201).json({ success: true, appointment });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Status (Store Owner)
router.put('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Agendamento não encontrado' });
        }

        // Verify ownership
        if (req.user?.role !== 'admin_master' && req.user?.storeId?.toString() !== appointment.storeId.toString()) {
            return res.status(403).json({ success: false, error: 'Sem permissão' });
        }

        appointment.status = status;
        await appointment.save();

        res.json({ success: true, appointment });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

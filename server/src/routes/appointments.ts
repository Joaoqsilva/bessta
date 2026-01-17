import express from 'express';
import rateLimit from 'express-rate-limit';
import { Appointment } from '../models/Appointment';
import { Service } from '../models/Service';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Store } from '../models/Store';
import { User } from '../models/User';
import NotificationService from '../services/NotificationService';
import { sendAppointmentConfirmation } from '../services/mailService';

const router = express.Router();

// Rate limiter for public appointment creation (prevent spam/abuse)
const appointmentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Max 10 appointments per hour per IP
    message: 'Muitos agendamentos criados. Tente novamente mais tarde.'
});

// Get my appointments (Client - by email)
router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { storeId } = req.query;
        const userEmail = req.user?.email;

        console.log('[MY_APPOINTMENTS] Fetching for email:', userEmail, 'storeId:', storeId);

        if (!userEmail) {
            return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        }

        const query: any = { customerEmail: userEmail };

        // Filter by store if provided
        if (storeId) {
            query.storeId = storeId;
        }

        console.log('[MY_APPOINTMENTS] Query:', JSON.stringify(query));

        const appointments = await Appointment.find(query)
            .sort({ date: -1 })
            .limit(50);

        console.log('[MY_APPOINTMENTS] Found:', appointments.length, 'appointments');

        res.json({ success: true, appointments });
    } catch (error: any) {
        console.error('Error fetching client appointments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

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
router.post('/', appointmentLimiter, async (req, res) => {
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

        // Check Plan Limits (30 Appointments/month for Free/Start plan)
        if (store.plan === 'start' || store.plan === 'free') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const nextMonth = new Date(startOfMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const aptCount = await Appointment.countDocuments({
                storeId,
                date: { $gte: startOfMonth, $lt: nextMonth }
            });

            if (aptCount >= 30) {
                return res.status(403).json({
                    success: false,
                    error: 'Esta loja atingiu o limite mensal de agendamentos do plano Grátis (30/mês). Tente agendar para o próximo mês ou entre em contato com o estabelecimento.',
                    code: 'PLAN_LIMIT_REACHED'
                });
            }
        }

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
            status: 'pending' // All new appointments start as pending
        });

        res.status(201).json({ success: true, appointment });

        // Trigger notification for store owner
        if (store.ownerId) {
            NotificationService.create(
                store.ownerId,
                'appointment',
                'Novo Agendamento',
                `${customerName} agendou ${service.name} para ${startDate.toLocaleString('pt-BR')}`,
                `/app/appointments`
            );
        }

        // Send email confirmation to customer
        sendAppointmentConfirmation(appointment, store).catch(err =>
            console.error('Failed to send confirmation email', err)
        );
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
        const userStoreId = req.user?.storeId?.toString();
        const aptStoreId = appointment.storeId?.toString();

        if (req.user?.role !== 'admin_master') {
            if (!userStoreId || userStoreId !== aptStoreId) {
                console.warn(`[UPDATE_STATUS_DENIED] User: ${req.user?._id} (${req.user?.email}) Store: ${userStoreId}, AptStore: ${aptStoreId}`);
                return res.status(403).json({ success: false, error: 'Sem permissão para alterar este agendamento' });
            }
        }

        appointment.status = status;
        await appointment.save();

        // Trigger notification for store owner (confirmation of their own action or system update)
        // Also could notify customer if we had a customer notification system
        const store = await Store.findById(appointment.storeId);
        if (store && store.ownerId) {
            const statusMap: any = {
                'confirmed': 'Confirmado',
                'cancelled': 'Cancelado',
                'completed': 'Concluído'
            };

            NotificationService.create(
                store.ownerId,
                'appointment',
                'Status de Agendamento Atualizado',
                `O agendamento de ${appointment.customerName} foi alterado para: ${statusMap[status] || status}`,
                `/app/appointments`
            );
        }

        res.json({ success: true, appointment });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

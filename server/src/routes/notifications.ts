import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { Notification } from '../models/Notification';

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, async (req: any, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar notificações' });
    }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authMiddleware, async (req: any, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar contagem de notificações' });
    }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.patch('/:id/read', authMiddleware, async (req: any, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, error: 'Erro ao marcar notificação como lida' });
    }
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read for the user
 * @access  Private
 */
router.patch('/read-all', authMiddleware, async (req: any, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: 'Todas as notificações foram marcadas como lidas'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, error: 'Erro ao marcar todas as notificações como lidas' });
    }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req: any, res) => {
    try {
        const result = await Notification.deleteOne({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
        }

        res.json({
            success: true,
            message: 'Notificação excluída com sucesso'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, error: 'Erro ao excluir notificação' });
    }
});

export default router;

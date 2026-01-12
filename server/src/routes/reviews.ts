// ========================================
// REVIEWS ROUTES
// Store reviews management
// ========================================

import express from 'express';
import rateLimit from 'express-rate-limit';
import { Review } from '../models/Review';
import { Store } from '../models/Store';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Rate limiter for public review creation (prevent spam and rating manipulation)
const reviewLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // Max 3 reviews per day per IP
    message: 'Muitas avaliações enviadas. Tente novamente amanhã.'
});

/**
 * GET /api/reviews/store/:storeId
 * Get reviews for a specific store (public)
 */
router.get('/store/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Support both ObjectId and slug
        let store;
        if (mongoose.Types.ObjectId.isValid(storeId)) {
            store = await Store.findById(storeId);
        } else {
            store = await Store.findOne({ slug: storeId });
        }

        if (!store) {
            return res.status(404).json({ error: 'Loja não encontrada' });
        }

        const reviews = await Review.find({ storeId: store._id, isVisible: true })
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Review.countDocuments({ storeId: store._id, isVisible: true });

        // Calculate average rating
        const avgResult = await Review.aggregate([
            { $match: { storeId: store._id, isVisible: true } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        const stats = avgResult[0] || { avgRating: 0, count: 0 };

        res.json({
            reviews,
            stats: {
                averageRating: Math.round(stats.avgRating * 10) / 10,
                totalReviews: stats.count
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
});

/**
 * POST /api/reviews/store/:storeId
 * Create a review for a store (public, no auth required)
 */
router.post('/store/:storeId', reviewLimiter, async (req, res) => {
    try {
        const { storeId } = req.params;
        const { customerName, customerEmail, rating, comment } = req.body;

        if (!customerName || !rating || !comment) {
            return res.status(400).json({ error: 'Nome, nota e comentário são obrigatórios' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Nota deve ser entre 1 e 5' });
        }

        // Support both ObjectId and slug
        let store;
        if (mongoose.Types.ObjectId.isValid(storeId)) {
            store = await Store.findById(storeId);
        } else {
            store = await Store.findOne({ slug: storeId });
        }

        if (!store) {
            return res.status(404).json({ error: 'Loja não encontrada' });
        }

        const review = await Review.create({
            storeId: store._id,
            customerName,
            customerEmail,
            rating,
            comment,
            isApproved: true,
            isVisible: true
        });

        // Update store rating
        const avgResult = await Review.aggregate([
            { $match: { storeId: store._id, isVisible: true } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        if (avgResult[0]) {
            store.rating = Math.round(avgResult[0].avgRating * 10) / 10;
            store.totalReviews = avgResult[0].count;
            await store.save();
        }

        res.status(201).json(review);
    } catch (error: any) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
});

/**
 * PUT /api/reviews/:id/respond
 * Store owner responds to a review
 */
router.put('/:id/respond', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { ownerResponse } = req.body;
        const user = req.user!;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        // Verify ownership
        const store = await Store.findById(review.storeId);
        if (!store || (!store.ownerId.equals(user._id) && user.role !== 'admin_master')) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        review.ownerResponse = ownerResponse;
        review.ownerResponseAt = new Date();
        await review.save();

        res.json(review);
    } catch (error: any) {
        console.error('Error responding to review:', error);
        res.status(500).json({ error: 'Erro ao responder avaliação' });
    }
});

/**
 * DELETE /api/reviews/:id
 * Delete review (store owner or admin)
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = req.user!;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        // Verify ownership
        const store = await Store.findById(review.storeId);
        if (!store || (!store.ownerId.equals(user._id) && user.role !== 'admin_master')) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await Review.findByIdAndDelete(id);

        // Update store rating
        const avgResult = await Review.aggregate([
            { $match: { storeId: store._id, isVisible: true } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        if (avgResult[0]) {
            store.rating = Math.round(avgResult[0].avgRating * 10) / 10;
            store.totalReviews = avgResult[0].count;
        } else {
            store.rating = 5;
            store.totalReviews = 0;
        }
        await store.save();

        res.json({ message: 'Avaliação excluída com sucesso' });
    } catch (error: any) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Erro ao excluir avaliação' });
    }
});

export default router;

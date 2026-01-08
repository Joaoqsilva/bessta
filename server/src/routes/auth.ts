// ========================================
// AUTH ROUTES
// Registration, Login, Profile
// ========================================

import { Router, Response } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Helper to create slug from store name
 */
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * POST /api/auth/register
 * Register a new user and store
 */
router.post('/register', async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, ownerName, phone, storeName, category } = req.body;

        // Validate required fields
        if (!email || !password || !ownerName || !storeName) {
            return res.status(400).json({
                success: false,
                error: 'Email, senha, nome e nome da loja são obrigatórios'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Este email já está em uso'
            });
        }

        // Generate unique slug
        let slug = createSlug(storeName);
        const existingSlug = await Store.findOne({ slug });
        if (existingSlug) {
            slug = `${slug}-${uuidv4().slice(0, 6)}`;
        }

        // Create user first
        const user = new User({
            email: email.toLowerCase(),
            password,
            ownerName,
            phone: phone || '',
            role: 'store_owner',
        });

        await user.save();

        // Create store
        const store = new Store({
            slug,
            name: storeName,
            description: `Bem-vindo à ${storeName}! Agende seu horário conosco.`,
            category: category || 'other',
            email: email.toLowerCase(),
            phone: phone || '',
            ownerId: user._id,
            ownerName,
        });

        await store.save();

        // Update user with store reference
        user.storeId = store._id;
        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                ownerName: user.ownerName,
                phone: user.phone,
                role: user.role,
                storeId: store._id,
            },
            store: {
                id: store._id,
                slug: store.slug,
                name: store.name,
                plan: store.plan,
            }
        });
    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email ou slug já está em uso'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao registrar usuário'
        });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        // Find user with password field
        const user = await User.findOne({
            email: email.toLowerCase()
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email ou senha incorretos'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Conta desativada. Entre em contato com o suporte.'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Email ou senha incorretos'
            });
        }

        // Get store if exists
        let store = null;
        if (user.storeId) {
            store = await Store.findById(user.storeId);
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                ownerName: user.ownerName,
                phone: user.phone,
                role: user.role,
                storeId: user.storeId,
            },
            store: store ? {
                id: store._id,
                slug: store.slug,
                name: store.name,
                plan: store.plan,
                customDomain: store.customDomain,
                domainVerified: store.domainVerified,
            } : null
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao fazer login'
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;

        // Get store
        let store = null;
        if (user.storeId) {
            store = await Store.findById(user.storeId);
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                ownerName: user.ownerName,
                phone: user.phone,
                role: user.role,
                storeId: user.storeId,
                createdAt: user.createdAt,
            },
            store: store ? {
                id: store._id,
                slug: store.slug,
                name: store.name,
                description: store.description,
                category: store.category,
                plan: store.plan,
                status: store.status,
                customDomain: store.customDomain,
                domainVerified: store.domainVerified,
                rating: store.rating,
                totalReviews: store.totalReviews,
                createdAt: store.createdAt,
            } : null
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar perfil'
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        const { ownerName, phone } = req.body;

        // Update user
        if (ownerName) user.ownerName = ownerName;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        // Update store owner name if changed
        if (ownerName && user.storeId) {
            await Store.findByIdAndUpdate(user.storeId, { ownerName });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                ownerName: user.ownerName,
                phone: user.phone,
                role: user.role,
            }
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar perfil'
        });
    }
});

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Senha atual e nova senha são obrigatórias'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Nova senha deve ter pelo menos 6 caracteres'
            });
        }

        // Get user with password
        const user = await User.findById(req.userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Senha atual incorreta'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Senha atualizada com sucesso'
        });
    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao alterar senha'
        });
    }
});

export default router;

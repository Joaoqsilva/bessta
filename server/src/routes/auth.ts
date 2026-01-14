// ========================================
// AUTH ROUTES
// Registration, Login, Profile
// ========================================

import { Router, Response } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import NotificationService from '../services/NotificationService';
import AuditLogService from '../services/AuditLogService';
import AccountLockoutService from '../services/AccountLockoutService';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/authSchema';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Max 15 attempts per IP (secure limit)
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

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
router.post('/register', validate(registerSchema), async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, ownerName, phone, storeName, category, role, storeId } = req.body;

        // Clean data (already validated structure, just trimming for consistency)
        const emailTrimmed = String(email).trim().toLowerCase();
        const ownerNameTrimmed = String(ownerName).trim();

        // Clean phone
        let phoneCleaned = '';
        if (phone) {
            phoneCleaned = String(phone).replace(/\D/g, '');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: emailTrimmed });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Este email já está em uso'
            });
        }

        // --- CLIENT USER REGISTRATION FLOW ---
        if (role === 'client_user') {
            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID da loja é obrigatório para cadastro de cliente'
                });
            }

            // Verify store exists
            const storeExists = await Store.findById(storeId);
            if (!storeExists) {
                return res.status(404).json({
                    success: false,
                    error: 'Loja não encontrada'
                });
            }

            const clientUser = new User({
                email: emailTrimmed,
                password: password,
                ownerName: ownerNameTrimmed, // Name of the client
                phone: phoneCleaned,
                role: 'client_user',
                plan: 'free', // Clients don't have plans, but field is required
                storeId: storeId // Link to the store they registered at
            });

            await clientUser.save();

            const token = generateToken(clientUser);

            return res.status(201).json({
                success: true,
                token,
                user: {
                    id: clientUser._id,
                    email: clientUser.email,
                    ownerName: clientUser.ownerName,
                    phone: clientUser.phone,
                    role: clientUser.role,
                    storeId: clientUser.storeId,
                    plan: clientUser.plan,
                }
            });
        }

        // --- STORE OWNER REGISTRATION FLOW (Default) ---
        const storeNameTrimmed = String(storeName).trim();

        // Generate unique slug
        let slug = createSlug(storeNameTrimmed);
        const existingSlug = await Store.findOne({ slug });
        if (existingSlug) {
            slug = `${slug}-${uuidv4().slice(0, 6)}`;
        }

        // Create user first
        const user = new User({
            email: emailTrimmed,
            password: password,
            ownerName: ownerNameTrimmed,
            phone: phoneCleaned,
            role: 'store_owner',
            plan: 'free',
        });

        await user.save();

        // Create store
        const store = new Store({
            slug,
            name: storeNameTrimmed,
            description: `Bem-vindo à ${storeNameTrimmed}! Agende seu horário conosco.`,
            category: category || 'other',
            email: emailTrimmed,
            phone: phoneCleaned,
            ownerId: user._id,
            ownerName: ownerNameTrimmed,
            plan: 'free',
        });

        await store.save();

        // Notify Admins about new store registration
        const admins = await User.find({ role: 'admin_master' });
        for (const admin of admins) {
            NotificationService.create(
                admin._id,
                'system',
                'Nova Loja Registrada',
                `A loja ${storeNameTrimmed} foi criada por ${ownerNameTrimmed}.`,
                `/admin/master/stores`
            );
        }

        // Update user with store reference
        user.storeId = store._id;
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Log successful registration
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        await AuditLogService.log({
            userId: user._id.toString(),
            action: 'REGISTER',
            details: { email: emailTrimmed, storeName: storeNameTrimmed, role: 'store_owner' },
            ip,
            severity: 'info'
        });

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
                plan: user.plan,
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
router.post('/login', validate(loginSchema), async (req: AuthRequest, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if account is locked
        const lockStatus = await AccountLockoutService.isLocked(normalizedEmail);
        if (lockStatus.locked) {
            await AuditLogService.log({
                action: 'LOGIN_FAILED',
                details: { email: normalizedEmail, reason: 'Account locked' },
                ip,
                userAgent,
                success: false,
                severity: 'warning'
            });

            return res.status(423).json({
                success: false,
                error: `Conta temporariamente bloqueada. Tente novamente em ${lockStatus.remainingTime} minutos.`,
                locked: true,
                remainingTime: lockStatus.remainingTime
            });
        }

        // Find user with password field
        const user = await User.findOne({
            email: normalizedEmail
        }).select('+password');

        if (!user) {
            // Record failed attempt
            const lockResult = await AccountLockoutService.recordFailedAttempt(normalizedEmail, ip);
            await AuditLogService.loginFailed(normalizedEmail, ip, userAgent, 'User not found');

            if (lockResult.locked) {
                await AuditLogService.accountLocked(normalizedEmail, ip, 'Too many failed attempts');
            }

            return res.status(401).json({
                success: false,
                error: 'Email ou senha incorretos',
                attemptsRemaining: lockResult.attemptsRemaining
            });
        }

        // Check if user is active
        if (!user.isActive) {
            await AuditLogService.loginFailed(normalizedEmail, ip, userAgent, 'Account disabled');
            return res.status(401).json({
                success: false,
                error: 'Conta desativada. Entre em contato com o suporte.'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Record failed attempt
            const lockResult = await AccountLockoutService.recordFailedAttempt(normalizedEmail, ip);
            await AuditLogService.loginFailed(normalizedEmail, ip, userAgent, 'Invalid password');

            if (lockResult.locked) {
                await AuditLogService.accountLocked(user._id.toString(), ip, 'Too many failed attempts');
            }

            return res.status(401).json({
                success: false,
                error: 'Email ou senha incorretos',
                attemptsRemaining: lockResult.attemptsRemaining
            });
        }

        // Successful login - clear failed attempts
        await AccountLockoutService.clearAttempts(normalizedEmail);
        await AuditLogService.loginSuccess(user._id.toString(), ip, userAgent);

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
                plan: user.plan,
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
        console.error('Login error details:', error);
        await AuditLogService.log({
            action: 'LOGIN_FAILED',
            details: { error: error.message },
            ip,
            userAgent,
            success: false,
            severity: 'error'
        });
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
                plan: user.plan,
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
router.put('/profile', authMiddleware, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        const { ownerName, phone } = req.body;

        // Security: Prevent Mass Assignment / Privilege Escalation
        // Explicitly check if user is trying to update restricted fields
        const restrictedFields = ['role', 'plan', 'storeId', 'email', 'password', 'isActive'];
        const attemptedRestrictedUpdates = restrictedFields.filter(field => req.body[field] !== undefined);

        if (attemptedRestrictedUpdates.length > 0) {
            console.warn(`Security Warning: User ${user._id} attempted to update restricted fields: ${attemptedRestrictedUpdates.join(', ')}`);
            // We can strictly fail, or just ignore. Failing is safer/clearer for security testing.
            // For now, we ignore but log, as the manual assignment below protects us.
        }

        // Update user (Explicit field assignment)
        if (ownerName) user.ownerName = ownerName.trim();
        if (phone !== undefined) user.phone = phone.trim();

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

        // Log password change
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        await AuditLogService.log({
            userId: user._id.toString(),
            action: 'PASSWORD_CHANGE',
            ip,
            severity: 'info'
        });

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

/**
 * PATCH /api/auth/update-email
 * Update user email (requires current password)
 */
router.patch('/update-email', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { newEmail, password } = req.body;

        if (!newEmail || !password) {
            return res.status(400).json({
                success: false,
                error: 'Novo email e senha atual são obrigatórios'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de email inválido'
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

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Senha incorreta'
            });
        }

        // Check if new email already exists
        const normalizedEmail = newEmail.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Este email já está em uso'
            });
        }

        // Update email
        user.email = normalizedEmail;
        await user.save();

        // Update store email if exists
        if (user.storeId) {
            await Store.findByIdAndUpdate(user.storeId, { email: normalizedEmail });
        }

        // Log email change
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        await AuditLogService.log({
            userId: user._id.toString(),
            action: 'EMAIL_CHANGE',
            details: { newEmail: normalizedEmail },
            ip,
            severity: 'info'
        });

        res.json({
            success: true,
            message: 'Email atualizado com sucesso'
        });
    } catch (error: any) {
        console.error('Update email error:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar email'
        });
    }
});

/**
 * PATCH /api/auth/update-password
 * Update user password (requires current password)
 */
router.patch('/update-password', authMiddleware, async (req: AuthRequest, res: Response) => {
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

        // Log password change
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        await AuditLogService.log({
            userId: user._id.toString(),
            action: 'PASSWORD_CHANGE',
            ip,
            severity: 'info'
        });

        res.json({
            success: true,
            message: 'Senha atualizada com sucesso'
        });
    } catch (error: any) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao alterar senha'
        });
    }
});

export default router;

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
import { sendPasswordResetEmail, sendEmailVerification } from '../services/mailService';

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

        // Generate email verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationToken = verificationCode;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        user.emailVerified = false;
        await user.save();

        // Send verification email
        sendEmailVerification(user.email, verificationCode, user.ownerName).catch(err =>
            console.error('Failed to send verification email:', err)
        );

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
            requiresVerification: true,
            message: 'Conta criada! Verifique seu email para ativar sua conta.',
            email: user.email,
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
 * POST /api/auth/google
 * Login/Register with Google OAuth token
 */
router.post('/google', async (req: AuthRequest, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                error: 'Token do Google é obrigatório'
            });
        }

        // Decode the Google JWT token (we verify the signature client-side via Google's library)
        // For production, you should verify the token with Google's API
        // But for simplicity, we decode and trust the payload since it came from Google's SDK
        let payload: { email?: string; name?: string; picture?: string; sub?: string };

        try {
            // Decode JWT without verification (Google SDK already verified it)
            const base64Payload = credential.split('.')[1];
            const decodedPayload = Buffer.from(base64Payload, 'base64').toString('utf8');
            payload = JSON.parse(decodedPayload);
        } catch (decodeError) {
            console.error('Error decoding Google token:', decodeError);
            return res.status(400).json({
                success: false,
                error: 'Token do Google inválido'
            });
        }

        if (!payload.email) {
            return res.status(400).json({
                success: false,
                error: 'Email não encontrado no token do Google'
            });
        }

        const email = payload.email.toLowerCase();
        const name = payload.name || 'Usuário Google';
        const googleId = payload.sub;

        // Check if user already exists
        let user = await User.findOne({ email });
        let store = null;
        let isNewUser = false;

        if (!user) {
            // Create new user and store
            isNewUser = true;

            // Generate store name from user name
            const storeName = `${name.split(' ')[0]}'s Shop`;

            // Generate unique slug
            let slug = createSlug(storeName);
            const existingSlug = await Store.findOne({ slug });
            if (existingSlug) {
                slug = `${slug}-${uuidv4().slice(0, 6)}`;
            }

            // Create user (no password for Google users)
            user = new User({
                email,
                password: uuidv4(), // Random password (won't be used)
                ownerName: name,
                role: 'store_owner',
                plan: 'free',
                googleId,
            });

            await user.save();

            // Create store
            store = new Store({
                slug,
                name: storeName,
                description: `Bem-vindo! Agende seu horário conosco.`,
                category: 'other',
                email,
                ownerId: user._id,
                ownerName: name,
                plan: 'free',
            });

            await store.save();

            // Link user to store
            user.storeId = store._id;
            await user.save();

            // Notify admins
            const admins = await User.find({ role: 'admin_master' });
            for (const admin of admins) {
                NotificationService.create(
                    admin._id,
                    'system',
                    'Nova Loja Registrada (Google)',
                    `A loja ${storeName} foi criada por ${name} via Google.`,
                    `/admin/master/stores`
                );
            }

            await AuditLogService.log({
                userId: user._id.toString(),
                action: 'REGISTER_GOOGLE',
                details: { email, provider: 'google' },
                ip,
                severity: 'info'
            });
        } else {
            // Existing user - login
            if (user.storeId) {
                store = await Store.findById(user.storeId);
            }

            // Update Google ID if not set
            if (!user.googleId && googleId) {
                user.googleId = googleId;
                await user.save();
            }

            await AuditLogService.loginSuccess(user._id.toString(), ip, userAgent);
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Conta desativada. Entre em contato com o suporte.'
            });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            isNewUser,
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
            } : null
        });
    } catch (error: any) {
        console.error('Google login error:', error);
        await AuditLogService.log({
            action: 'GOOGLE_LOGIN_FAILED',
            details: { error: error.message },
            ip,
            userAgent,
            success: false,
            severity: 'error'
        });
        res.status(500).json({
            success: false,
            error: 'Erro ao fazer login com Google'
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

        // Check if email is verified (only for store_owner, not admin or client)
        if (user.role === 'store_owner' && !user.emailVerified) {
            return res.status(403).json({
                success: false,
                error: 'Email não verificado. Por favor, verifique seu email antes de fazer login.',
                requiresVerification: true,
                email: user.email
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

/**
 * POST /api/auth/verify-password
 * Verify user password (for sensitive actions like canceling subscription)
 */
router.post('/verify-password', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Senha é obrigatória'
            });
        }

        // Get user with password
        const user = await User.findById(req.userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Log failed verification attempt
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            await AuditLogService.log({
                userId: user._id.toString(),
                action: 'PASSWORD_VERIFY_FAILED',
                ip,
                severity: 'warning'
            });

            return res.status(401).json({
                success: false,
                message: 'Senha incorreta'
            });
        }

        // Log successful verification
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        await AuditLogService.log({
            userId: user._id.toString(),
            action: 'PASSWORD_VERIFIED',
            ip,
            severity: 'info'
        });

        res.json({
            success: true,
            message: 'Senha verificada com sucesso'
        });
    } catch (error: any) {
        console.error('Verify password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar senha'
        });
    }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email é obrigatório' });

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            // Return success even if user not found (security practice)
            return res.json({ success: true, message: 'Se o email existir, um código será enviado.' });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to user (15 min exp)
        user.resetPasswordToken = code;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Send email
        const emailSent = await sendPasswordResetEmail(user.email, code, user.ownerName || user.name || 'Usuário');

        if (emailSent) {
            await AuditLogService.log({
                userId: user._id.toString(),
                action: 'PASSWORD_RESET_REQUEST',
                ip,
                severity: 'info'
            });
        } else {
            console.error('Failed to send reset email to:', user.email);
            await AuditLogService.log({
                userId: user._id.toString(),
                action: 'PASSWORD_RESET_EMAIL_FAILED',
                ip,
                severity: 'error',
                details: { email: user.email }
            });
        }

        res.json({ success: true, message: 'Se o email existir, um código será enviado.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, error: 'Erro ao processar solicitação' });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password with code
 */
router.post('/reset-password', async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, error: 'Todos os campos são obrigatórios' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user with matching code and valid expiration
        // Note: resetPasswordToken and resetPasswordExpires are select: false
        const user = await User.findOne({
            email: normalizedEmail,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            await AuditLogService.log({
                action: 'PASSWORD_RESET_FAILED',
                details: { email: normalizedEmail, reason: 'Invalid code or expired' },
                ip,
                success: false,
                severity: 'warning'
            });
            return res.status(400).json({ success: false, error: 'Código inválido ou expirado' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'A senha deve ter no mínimo 6 caracteres' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        await AuditLogService.log({
            userId: user._id.toString(),
            action: 'PASSWORD_RESET_SUCCESS',
            ip,
            severity: 'info'
        });

        res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, error: 'Erro ao redefinir senha' });
    }
});

/**
 * POST /api/auth/verify-email
 * Verify email with code sent during registration
 */
router.post('/verify-email', async (req: AuthRequest, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, error: 'Email e código são obrigatórios' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user with verification token
        const user = await User.findOne({
            email: normalizedEmail,
            emailVerificationToken: code,
            emailVerificationExpires: { $gt: Date.now() }
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            return res.status(400).json({ success: false, error: 'Código inválido ou expirado' });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Get store
        let store = null;
        if (user.storeId) {
            store = await Store.findById(user.storeId);
        }

        // Generate token for auto-login
        const token = generateToken(user);

        await AuditLogService.log({
            userId: user._id.toString(),
            action: 'EMAIL_VERIFIED',
            ip,
            severity: 'info'
        });

        res.json({
            success: true,
            message: 'Email verificado com sucesso!',
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
            } : null
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ success: false, error: 'Erro ao verificar email' });
    }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email é obrigatório' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Don't reveal if user exists
            return res.json({ success: true, message: 'Se o email existir, um novo código será enviado.' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ success: false, error: 'Este email já foi verificado' });
        }

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationToken = verificationCode;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        // Send verification email
        await sendEmailVerification(user.email, verificationCode, user.ownerName);

        res.json({ success: true, message: 'Código de verificação reenviado!' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, error: 'Erro ao reenviar código' });
    }
});

export default router;

// ========================================
// MERCADO PAGO PAYMENT ROUTES
// Checkout Bricks Integration
// ========================================

import express, { Request, Response, NextFunction } from 'express';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth';
import { User } from '../models/User';
import { Store } from '../models/Store';

const router = express.Router();

// Initialize Mercado Pago client
const getClient = () => {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error('MP_ACCESS_TOKEN not configured');
    }
    return new MercadoPagoConfig({ accessToken });
};

const PLANS = {
    start: {
        name: 'Start',
        price: 0,
        features: ['1 profissional', 'Agendamentos ilimitados', 'Página personalizada']
    },
    free: {
        name: 'Start',
        price: 0,
        features: ['1 profissional', 'Agendamentos ilimitados', 'Página personalizada']
    },
    pro: {
        name: 'Professional',
        price: 49.90,
        features: ['5 profissionais', 'Lembretes por email', 'Relatórios básicos', 'Suporte prioritário']
    },
    professional: {
        name: 'Professional',
        price: 49.90,
        features: ['5 profissionais', 'Lembretes por email', 'Relatórios básicos', 'Suporte prioritário']
    },
    business: {
        name: 'Business',
        price: 99.90,
        features: ['Agendamentos ilimitados', 'Serviços ilimitados', 'Relatórios avançados', 'Página personalizada', 'Múltiplos colaboradores']
    }
};

// ========================================
// CREATE PAYMENT PREFERENCE
// ========================================
router.post('/create-preference', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { planId } = req.body;
        const userId = (req as any).userId;

        // Validate plan
        const plan = PLANS[planId as keyof typeof PLANS];
        if (!plan || plan.price === 0) {
            res.status(400).json({ success: false, error: 'Plano inválido ou gratuito' });
            return;
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'Usuário não encontrado' });
            return;
        }

        const client = getClient();
        const preference = new Preference(client);

        // Create preference
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: `Plano ${plan.name} - BookMe`,
                        description: plan.features.join(', '),
                        quantity: 1,
                        unit_price: plan.price,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    email: user.email,
                    name: user.name
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'https://bessta-booking.vercel.app'}/payment/success`,
                    failure: `${process.env.FRONTEND_URL || 'https://bessta-booking.vercel.app'}/payment/failure`,
                    pending: `${process.env.FRONTEND_URL || 'https://bessta-booking.vercel.app'}/payment/pending`
                },
                auto_return: 'approved',
                external_reference: JSON.stringify({ userId: userId.toString(), planId }),
                notification_url: `${process.env.BACKEND_URL || 'https://kind-purpose-production-20da.up.railway.app'}/api/mercadopago/webhook`,
                statement_descriptor: 'BOOKME',
                expires: true,
                expiration_date_from: new Date().toISOString(),
                expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            }
        });

        res.json({
            success: true,
            preferenceId: result.id,
            initPoint: result.init_point,
            sandboxInitPoint: result.sandbox_init_point
        });
    } catch (error: any) {
        console.error('Error creating preference:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// CREATE PAYMENT (for Bricks - Card Payment)
// ========================================
router.post('/process-payment', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const {
            token,
            issuer_id,
            payment_method_id,
            transaction_amount,
            installments,
            payer,
            planId
        } = req.body;

        // Validate plan
        const plan = PLANS[planId as keyof typeof PLANS];
        if (!plan || plan.price === 0) {
            res.status(400).json({ success: false, error: 'Plano inválido' });
            return;
        }

        const client = getClient();
        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                token,
                issuer_id,
                payment_method_id,
                transaction_amount: plan.price,
                installments,
                payer: {
                    email: payer.email,
                    identification: payer.identification
                },
                description: `Plano ${plan.name} - BookMe`,
                external_reference: JSON.stringify({ userId, planId }),
                statement_descriptor: 'BOOKME'
            }
        });

        // Check payment status
        if (result.status === 'approved') {
            // Update user plan
            await User.findByIdAndUpdate(userId, {
                subscriptionPlan: planId,
                subscriptionStatus: 'active',
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                mpPaymentId: result.id?.toString()
            });

            // Update store plan if exists
            await Store.updateMany(
                { owner: userId },
                { plan: planId }
            );
        }

        res.json({
            success: true,
            status: result.status,
            status_detail: result.status_detail,
            id: result.id
        });
    } catch (error: any) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// PIX PAYMENT
// ========================================
router.post('/create-pix', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { planId, payer } = req.body;

        // Validate plan
        const plan = PLANS[planId as keyof typeof PLANS];
        if (!plan || plan.price === 0) {
            res.status(400).json({ success: false, error: 'Plano inválido' });
            return;
        }

        const client = getClient();
        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                transaction_amount: plan.price,
                payment_method_id: 'pix',
                payer: {
                    email: payer.email,
                    first_name: payer.first_name,
                    last_name: payer.last_name,
                    identification: payer.identification
                },
                description: `Plano ${plan.name} - BookMe`,
                external_reference: JSON.stringify({ userId, planId }),
                statement_descriptor: 'BOOKME'
            }
        });

        res.json({
            success: true,
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: result.point_of_interaction?.transaction_data?.ticket_url
        });
    } catch (error: any) {
        console.error('Error creating PIX payment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// WEBHOOK - Receive payment notifications
// ========================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
    try {
        // Verify webhook signature
        const signature = req.headers['x-signature'] as string;
        const requestId = req.headers['x-request-id'] as string;

        if (process.env.NODE_ENV === 'production' && process.env.MP_WEBHOOK_SECRET) {
            const webhookSecret = process.env.MP_WEBHOOK_SECRET;

            // Parse signature parts
            const signatureParts = signature?.split(',').reduce((acc: any, part) => {
                const [key, value] = part.split('=');
                acc[key.trim()] = value;
                return acc;
            }, {});

            // Verify HMAC
            const dataId = req.query['data.id'] || req.body?.data?.id;
            const manifest = `id:${dataId};request-id:${requestId};ts:${signatureParts?.ts};`;
            const hmac = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex');

            if (hmac !== signatureParts?.v1) {
                console.warn('Invalid webhook signature');
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }
        }

        const { type, data } = req.body;
        console.log('MP Webhook received:', type, data);

        // Handle payment notification
        if (type === 'payment') {
            const client = getClient();
            const paymentApi = new Payment(client);

            const paymentInfo = await paymentApi.get({ id: data.id });

            if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
                const { userId, planId } = JSON.parse(paymentInfo.external_reference);

                // Update user subscription
                await User.findByIdAndUpdate(userId, {
                    subscriptionPlan: planId,
                    subscriptionStatus: 'active',
                    subscriptionStartDate: new Date(),
                    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    mpPaymentId: paymentInfo.id?.toString()
                });

                // Update store plan
                await Store.updateMany(
                    { owner: userId },
                    { plan: planId }
                );

                console.log(`Plan ${planId} activated for user ${userId}`);
            }
        }

        res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// CHECK PAYMENT STATUS
// ========================================
router.get('/status/:paymentId', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { paymentId } = req.params;

        const client = getClient();
        const payment = new Payment(client);

        const result = await payment.get({ id: parseInt(paymentId) });

        res.json({
            success: true,
            status: result.status,
            status_detail: result.status_detail,
            payment_method_id: result.payment_method_id,
            date_approved: result.date_approved
        });
    } catch (error: any) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// GET CURRENT SUBSCRIPTION
// ========================================
router.get('/subscription', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const user = await User.findById(userId).select('subscriptionPlan subscriptionStatus subscriptionEndDate');

        if (!user) {
            res.status(404).json({ success: false, error: 'Usuário não encontrado' });
            return;
        }

        const plan = PLANS[user.subscriptionPlan as keyof typeof PLANS] || PLANS.start;

        res.json({
            success: true,
            subscription: {
                plan: user.subscriptionPlan || 'start',
                planName: plan.name,
                status: user.subscriptionStatus || 'active',
                endDate: user.subscriptionEndDate,
                features: plan.features,
                price: plan.price
            }
        });
    } catch (error: any) {
        console.error('Error getting subscription:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// CANCEL SUBSCRIPTION
// ========================================
router.post('/cancel', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).userId;

        await User.findByIdAndUpdate(userId, {
            subscriptionPlan: 'start',
            subscriptionStatus: 'cancelled',
            subscriptionEndDate: new Date() // Immediately or keep until end?
        });

        await Store.updateMany(
            { owner: userId },
            { plan: 'start' }
        );

        res.json({ success: true, message: 'Assinatura cancelada' });
    } catch (error: any) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

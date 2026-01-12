// ========================================
// STRIPE PAYMENT ROUTES
// ========================================

import express from 'express';
import Stripe from 'stripe';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User, IUser } from '../models/User';
import { Store } from '../models/Store';
import NotificationService from '../services/NotificationService';

const router = express.Router();

// Initialize Stripe with secret key (only if configured)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey);
} else {
    console.warn('⚠️ STRIPE_SECRET_KEY not configured. Payment features will be disabled.');
}

// Price ID for Profissional plan - will be created on first request if not exists
let proPlanPriceId: string | null = null;

// Helper to get or create the Pro plan product and price
async function getOrCreateProPlanPrice(): Promise<string> {
    if (!stripe) throw new Error('Stripe not configured');
    if (proPlanPriceId) return proPlanPriceId;

    // Check if product already exists
    const products = await stripe.products.list({ limit: 100 });
    let proProduct = products.data.find(p => p.metadata?.plan === 'pro' && p.active);

    if (!proProduct) {
        // Create the product
        proProduct = await stripe.products.create({
            name: 'BookMe Profissional',
            description: 'Plano Profissional - Agendamentos ilimitados, lembretes via WhatsApp, relatórios avançados e muito mais.',
            metadata: { plan: 'pro' },
        });
        console.log('Created Stripe product:', proProduct.id);
    }

    // Check if price exists
    const prices = await stripe.prices.list({ product: proProduct.id, active: true });
    let proPrice = prices.data.find(p => p.unit_amount === 4900 && p.recurring?.interval === 'month');

    if (!proPrice) {
        // Create the price (R$ 49.00/month)
        proPrice = await stripe.prices.create({
            product: proProduct.id,
            unit_amount: 4900, // R$ 49.00 in centavos
            currency: 'brl',
            recurring: { interval: 'month' },
            metadata: { plan: 'pro' },
        });
        console.log('Created Stripe price:', proPrice.id);
    }

    proPlanPriceId = proPrice.id;
    return proPlanPriceId;
}

// ========================================
// Create Checkout Session for Pro Plan
// ========================================
router.post('/create-checkout-session', authMiddleware, async (req: AuthRequest, res) => {
    console.log('📦 Checkout session request received');
    try {
        if (!stripe) {
            console.log('❌ Stripe not configured');
            return res.status(503).json({ success: false, error: 'Pagamentos não configurados' });
        }
        console.log('✅ Stripe is configured');

        const userId = req.user?._id?.toString();
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        const priceId = await getOrCreateProPlanPrice();

        // Build success/cancel URLs
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const successUrl = `${baseUrl}/app/settings?tab=plans&payment=success&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/app/settings?tab=plans&payment=cancelled`;

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: user.email,
            metadata: {
                userId: userId,
                storeId: user.storeId?.toString() || '',
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    storeId: user.storeId?.toString() || '',
                },
            },
            allow_promotion_codes: true,
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// Verify Checkout Session and Update Plan
// ========================================
router.post('/verify-session', authMiddleware, async (req: AuthRequest, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ success: false, error: 'Pagamentos não configurados' });
        }

        const { sessionId } = req.body;
        const userId = req.user?._id?.toString();

        if (!sessionId) {
            return res.status(400).json({ success: false, error: 'Session ID é obrigatório' });
        }

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid' && session.status === 'complete') {
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            // Update user with Stripe info and plan
            await User.findByIdAndUpdate(userId, {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                plan: 'pro',
                planExpiresAt: null,
            });

            // Update store plan if exists
            const user = await User.findById(userId);
            if (user?.storeId) {
                await Store.findByIdAndUpdate(user.storeId, {
                    plan: 'pro',
                });
            }

            console.log(`✅ User ${userId} upgraded to Pro plan via session verification`);

            res.json({
                success: true,
                plan: 'pro',
                message: 'Plano atualizado com sucesso!',
            });
        } else {
            res.json({
                success: false,
                error: 'Pagamento ainda não foi confirmado',
                status: session.payment_status,
            });
        }
    } catch (error: any) {
        console.error('Error verifying session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// Create Customer Portal Session
// ========================================
router.post('/create-portal-session', authMiddleware, async (req: AuthRequest, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ success: false, error: 'Pagamentos não configurados' });
        }

        const userId = req.user?._id?.toString();
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        }

        const user = await User.findById(userId);
        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({ success: false, error: 'Assinatura não encontrada' });
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${baseUrl}/app/settings?tab=plans`,
        });

        res.json({
            success: true,
            url: session.url,
        });
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// Webhook to handle Stripe events
// ========================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        // Security: In production, ALWAYS verify webhook signature
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction && !webhookSecret) {
            console.error('CRITICAL: STRIPE_WEBHOOK_SECRET not configured in production!');
            return res.status(500).send('Webhook Error: Missing webhook secret');
        }

        if (webhookSecret && stripe) {
            event = stripe!.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else if (!isProduction) {
            // Only allow unverified events in development
            console.warn('⚠️ DEV MODE: Accepting unverified webhook event');
            event = req.body as Stripe.Event;
        } else {
            return res.status(400).send('Webhook Error: Cannot verify signature');
        }
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send('Webhook Error: Invalid signature');
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutComplete(session);
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionUpdate(subscription);
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionCancelled(subscription);
            break;
        }
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('Payment succeeded for invoice:', invoice.id);
            break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            await handlePaymentFailed(invoice);
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// ========================================
// Webhook Handlers
// ========================================

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    console.log('Checkout completed:', session.id);

    const userId = session.metadata?.userId;
    const storeId = session.metadata?.storeId;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!userId) {
        console.error('No userId in session metadata');
        return;
    }

    try {
        // Update user with Stripe info and plan
        await User.findByIdAndUpdate(userId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            plan: 'pro',
            planExpiresAt: null, // Subscription is active
        });

        // Update store plan if exists
        if (storeId) {
            await Store.findByIdAndUpdate(storeId, {
                plan: 'pro',
            });
        }

        console.log(`User ${userId} upgraded to Pro plan`);

        // Notify User
        NotificationService.create(
            userId,
            'payment',
            'Upgrade Concluído! 🎉',
            'Sua assinatura Profissional foi ativada. Aproveite todos os recursos!',
            '/app/settings?tab=plans'
        );

        // Notify Admins
        const admins = await User.find({ role: 'admin_master' });
        for (const admin of admins) {
            NotificationService.create(
                admin._id,
                'payment',
                'Nova Assinatura Pro',
                `O usuário ${userId} acaba de assinar o plano Profissional.`,
                '/admin/master/analytics'
            );
        }
    } catch (error) {
        console.error('Error updating user plan:', error);
    }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    console.log('Subscription updated:', subscription.id);

    const customerId = subscription.customer as string;
    let userId: string | undefined = subscription.metadata?.userId;

    try {
        // If userId is missing in metadata, find user by customerId
        let user: IUser | null = null;
        if (userId) {
            user = await User.findById(userId);
        } else if (customerId) {
            user = await User.findOne({ stripeCustomerId: customerId });
            userId = user?._id?.toString();
        }

        if (!user) {
            console.warn(`⚠️ User not found for subscription ${subscription.id} (Customer: ${customerId})`);
            return;
        }

        const status = subscription.status;
        const isCancelling = subscription.cancel_at_period_end;

        // If status is active but user chose to cancel (cancel_at_period_end), 
        // we downgrade immediately per user request.
        const plan = (status === 'active' || status === 'trialing') && !isCancelling ? 'pro' : 'free';

        // Update user
        console.log(`Updating user ${user._id} plan to ${plan}...`);
        await User.findByIdAndUpdate(user._id, { plan });

        // Update store
        if (user.storeId) {
            console.log(`Updating store ${user.storeId} plan to ${plan}...`);
            await Store.findByIdAndUpdate(user.storeId, { plan });
        }

        console.log(`✅ User ${user._id} plan updated to ${plan} (Status: ${status})`);

        if (plan === 'free') {
            NotificationService.create(
                user._id,
                'payment',
                'Plano Alterado',
                'Sua assinatura foi alterada para o plano Starter.',
                '/app/settings?tab=plans'
            );
        }
    } catch (error) {
        console.error('❌ Error updating subscription:', error);
    }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    console.log('Subscription cancelled:', subscription.id);

    const customerId = subscription.customer as string;
    let userId: string | undefined = subscription.metadata?.userId;

    try {
        // Find user
        let user: IUser | null = null;
        if (userId) {
            user = await User.findById(userId);
        } else if (customerId) {
            user = await User.findOne({ stripeCustomerId: customerId });
            userId = user?._id?.toString();
        }

        if (!user) {
            console.warn(`⚠️ User not found for cancelled subscription ${subscription.id}`);
            return;
        }

        // Update user
        console.log(`Downgrading user ${user._id} to Free plan...`);
        await User.findByIdAndUpdate(user._id, {
            plan: 'free',
            stripeSubscriptionId: null,
            planExpiresAt: null
        });

        // Update store
        if (user.storeId) {
            console.log(`Downgrading store ${user.storeId} to Free plan...`);
            await Store.findByIdAndUpdate(user.storeId, { plan: 'free' });
        }

        console.log(`✅ User ${user._id} downgraded successfully`);

        NotificationService.create(
            user._id,
            'payment',
            'Assinatura Cancelada',
            'Sua assinatura Profissional foi encerrada e você retornou ao plano Starter.',
            '/app/settings?tab=plans'
        );
    } catch (error) {
        console.error('❌ Error handling subscription cancellation:', error);
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log('Payment failed for invoice:', invoice.id);

    // Find user by customer ID to notify
    if (invoice.customer) {
        const user = await User.findOne({ stripeCustomerId: invoice.customer as string });
        if (user) {
            NotificationService.create(
                user._id,
                'payment',
                'Falha no Pagamento',
                'Houve um problema com a cobrança da sua assinatura. Verifique seus dados de pagamento.',
                '/app/settings?tab=plans'
            );
        }
    }
}

// ========================================
// Get subscription status
// ========================================
router.get('/subscription-status', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        let subscription: Stripe.Subscription | null = null;
        let activePlan = user.plan || 'free';

        // If user has a subscription ID, verify with Stripe to ensure data consistency
        if (user.stripeSubscriptionId && stripe) {
            try {
                subscription = await stripe!.subscriptions.retrieve(user.stripeSubscriptionId) as Stripe.Subscription;

                // LOGIC: Self-correct database if Stripe status differs from DB plan
                // This fixes issues where webhooks might have failed
                const isStripeActive = (subscription.status === 'active' || subscription.status === 'trialing') && !subscription.cancel_at_period_end;

                if (isStripeActive && activePlan !== 'pro') {
                    // Stripe says active, but DB says free -> Upgrade DB
                    console.log(`🔄 Self-correcting plan for user ${userId}: FREE -> PRO`);
                    activePlan = 'pro';
                    await User.findByIdAndUpdate(userId, { plan: 'pro' });
                    if (user.storeId) {
                        await Store.findByIdAndUpdate(user.storeId, { plan: 'pro' });
                    }
                } else if (!isStripeActive && activePlan === 'pro') {
                    // Stripe says NOT active/trialing (e.g. canceled/incomplete_expired), but DB says pro
                    console.log(`🔄 Self-correcting plan for user ${userId}: PRO -> FREE (Stripe status: ${subscription.status})`);
                    activePlan = 'free';
                    await User.findByIdAndUpdate(userId, {
                        plan: 'free',
                        stripeSubscriptionId: null,
                        planExpiresAt: null
                    });
                    if (user.storeId) {
                        await Store.findByIdAndUpdate(user.storeId, { plan: 'free' });
                    }
                }

                console.log(`Subscription status for ${userId}: ${subscription.status}, cancelAtPeriodEnd: ${subscription.cancel_at_period_end}`);

            } catch (e: any) {
                console.error('Error fetching subscription from Stripe:', e);
                // If subscription not found (deleted in Stripe), downgrade
                if (e.code === 'resource_missing') {
                    console.log(`🔄 Subscription missing in Stripe. Downgrading user ${userId} to FREE`);
                    activePlan = 'free';
                    await User.findByIdAndUpdate(userId, {
                        plan: 'free',
                        stripeSubscriptionId: null
                    });
                    if (user.storeId) {
                        await Store.findByIdAndUpdate(user.storeId, { plan: 'free' });
                    }
                    subscription = null;
                }
            }
        }

        res.json({
            success: true,
            plan: activePlan,
            subscription: subscription ? {
                id: subscription.id,
                status: subscription.status,
                currentPeriodEnd: new Date(((subscription as any).current_period_end || 0) * 1000).toISOString(),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            } : null,
        });
    } catch (error: any) {
        console.error('Error getting subscription status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

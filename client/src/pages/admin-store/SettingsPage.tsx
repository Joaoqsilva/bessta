import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    User, Store, Bell, CreditCard, Shield, Palette, Globe,
    Check, Zap, Crown, ExternalLink, Copy, Upload, Image,
    Instagram, MessageCircle, Facebook, RefreshCw, Eye,
    CheckCircle, XCircle, AlertCircle, Info, Loader2
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, TextArea } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { useAuth, type WorkingHour } from '../../context/AuthContext';
import {
    getStoreCustomization,
    saveStoreCustomization,
    resetStoreCustomization,
    imageToBase64,
    PRESET_COLORS,
    FONT_OPTIONS,
    LAYOUT_OPTIONS,
    BUTTON_STYLES,
    type StoreCustomization
} from '../../context/StoreCustomizationService';
import * as domainApi from '../../services/domainApi';
import { paymentService, PLANS as MP_PLANS } from '../../services/paymentService';
import { storeApi } from '../../services/storeApi';
import MercadoPagoCheckout from '../../components/payment/MercadoPagoCheckout';
import './SettingsPage.css';

const PLANS = [
    {
        id: 'free',
        name: 'Starter',
        price: 0,
        period: 'Grátis',
        description: 'Para começar',
        features: [
            'Até 30 agendamentos/mês',
            '1 serviço cadastrado',
            'Lembretes por email',
            'Suporte por email',
        ],
        limitations: [
            'Sem WhatsApp',
            'Sem relatórios',
        ],
        color: 'surface',
    },
    {
        id: 'pro',
        name: 'Profissional',
        price: 49,
        period: '/mês',
        description: 'Mais popular',
        features: [
            'Agendamentos ilimitados',
            'Serviços ilimitados',
            'Lembretes via WhatsApp',
            'Relatórios avançados',
            'Página personalizada',
            'Domínio personalizado',
            'Múltiplos colaboradores',
            'Suporte prioritário',
        ],
        limitations: [],
        color: 'primary',
        popular: true,
    },
];

type Tab = 'profile' | 'store' | 'domain' | 'appearance' | 'notifications' | 'plans' | 'security';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { store, logout, user, isLoading: isAuthLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    // Initialize currentPlan as null to indicate it's loading, or 'free' only when auth is ready
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Sync plan with store/user context updates
    useEffect(() => {
        if (isAuthLoading) return;

        const plan = store?.plan || (user as any)?.plan || 'free';
        setCurrentPlan(plan);
    }, [store, user, isAuthLoading]);

    // Load detailed subscription status from backend on mount AND when returning from Stripe portal
    useEffect(() => {
        const loadSubscriptionStatus = async () => {
            if (!store?.id && !user?.id) return;

            try {
                const response = await paymentService.getSubscription();
                console.log('DEBUG: Subscription status response:', response);
                if (response.success && response.subscription) {
                    setCurrentPlan(response.subscription.plan);
                    setSubscriptionStatus({
                        id: '',
                        status: response.subscription.status,
                        currentPeriodEnd: response.subscription.endDate || '',
                        cancelAtPeriodEnd: response.subscription.status === 'cancelled'
                    });
                }
            } catch (error) {
                console.error('Failed to load subscription status:', error);
            }
        };

        // Load on mount
        loadSubscriptionStatus();

        // Also reload when tab becomes visible (user returns from Stripe portal)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible - reloading subscription status...');
                loadSubscriptionStatus();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, store?.id]);

    // Check for payment success/cancelled from URL params and verify session
    useEffect(() => {
        const payment = searchParams.get('payment');
        const tab = searchParams.get('tab');
        const sessionId = searchParams.get('session_id');

        if (tab === 'plans') {
            setActiveTab('plans');
        }

        if (payment === 'success' && sessionId) {
            // Verify the session and update the plan in the database
            const verifyPayment = async () => {
                try {
                    const result = await paymentService.verifySession(sessionId);
                    if (result.success && result.plan === 'pro') {
                        setCurrentPlan('pro');
                        setPaymentMessage({ type: 'success', text: 'Pagamento realizado com sucesso! Seu plano foi atualizado para Profissional.' });
                    } else {
                        // Still show success but reload status
                        setPaymentMessage({ type: 'success', text: 'Pagamento realizado com sucesso! Seu plano foi atualizado.' });
                        // Reload subscription status
                        const status = await paymentService.getSubscriptionStatus();
                        if (status.success) {
                            setCurrentPlan(status.plan || 'free');
                        }
                    }
                } catch (error) {
                    console.error('Error verifying session:', error);
                    setPaymentMessage({ type: 'success', text: 'Pagamento realizado! Atualizando seu plano...' });
                    // Try to reload subscription status anyway
                    try {
                        const status = await paymentService.getSubscriptionStatus();
                        if (status.success) {
                            setCurrentPlan(status.plan || 'free');
                        }
                    } catch (e) {
                        console.error('Error getting subscription status:', e);
                    }
                }
            };
            verifyPayment();
            // Clear URL params
            window.history.replaceState({}, '', '/app/settings?tab=plans');
        } else if (payment === 'success') {
            setPaymentMessage({ type: 'success', text: 'Pagamento realizado com sucesso! Seu plano foi atualizado.' });
            setCurrentPlan('pro');
            window.history.replaceState({}, '', '/app/settings?tab=plans');
        } else if (payment === 'cancelled') {
            setPaymentMessage({ type: 'error', text: 'Pagamento cancelado. Você ainda está no plano gratuito.' });
            window.history.replaceState({}, '', '/app/settings?tab=plans');
        }
    }, [searchParams]);

    // State for Mercado Pago Checkout Modal
    const [showMPCheckout, setShowMPCheckout] = useState(false);
    const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{ id: string; name: string; price: number; features: string[] } | null>(null);

    // Handle Mercado Pago Checkout
    const handleMercadoPagoCheckout = (planId: string) => {
        const plan = MP_PLANS.find(p => p.id === planId);
        if (plan && plan.price > 0) {
            setSelectedPlanForCheckout(plan);
            setShowMPCheckout(true);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = (paymentId: string) => {
        console.log('Payment successful:', paymentId);
        setPaymentMessage({ type: 'success', text: 'Pagamento realizado com sucesso! Seu plano foi atualizado.' });
        if (selectedPlanForCheckout) {
            setCurrentPlan(selectedPlanForCheckout.id);
        }
        setShowMPCheckout(false);
        setSelectedPlanForCheckout(null);
    };

    // Handle payment error
    const handlePaymentError = (error: string) => {
        console.error('Payment error:', error);
        setPaymentMessage({ type: 'error', text: `Erro no pagamento: ${error}` });
    };

    // Handle Manage Subscription (Cancel)
    const handleManageSubscription = async () => {
        if (confirm('Tem certeza que deseja cancelar sua assinatura? Você voltará para o plano gratuito.')) {
            setIsCheckoutLoading(true);
            try {
                const response = await paymentService.cancelSubscription();
                if (response.success) {
                    setCurrentPlan('start');
                    setPaymentMessage({ type: 'success', text: 'Assinatura cancelada com sucesso.' });
                }
            } catch (error) {
                console.error('Cancel error:', error);
                setPaymentMessage({ type: 'error', text: 'Erro ao cancelar assinatura.' });
            } finally {
                setIsCheckoutLoading(false);
            }
        }
    };

    // Danger zone modals
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Handle Deactivate Account
    const handleDeactivateAccount = async () => {
        if (!store?.id) return;

        try {
            const result = await storeApi.updateStatus(store.id, 'suspended');
            if (result.success) {
                alert('Sua conta foi desativada. Você pode reativá-la entrando em contato com o suporte.');
                logout();
                navigate('/');
            } else {
                alert('Erro ao desativar conta.');
            }
        } catch (error) {
            console.error('Error deactivating account:', error);
            alert('Erro ao desativar conta.');
        }
    };

    // Handle Delete Account
    const handleDeleteAccount = async () => {
        if (!store?.id || deleteConfirmText !== 'EXCLUIR') return;

        try {
            const result = await storeApi.deleteStore(store.id);
            if (result.success) {
                alert('Sua conta e todos os dados foram excluídos permanentemente.');
                logout();
                navigate('/');
            } else {
                alert('Erro ao excluir conta.');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Erro ao excluir conta.');
        }
    };


    // Customization state
    const [customization, setCustomization] = useState<StoreCustomization | null>(null);

    // Load customization on mount
    useEffect(() => {
        if (store?.id) {
            getStoreCustomization(store.id).then(setCustomization);
        }
    }, [store?.id]);

    // Form states - initialize from store data
    const [profileData, setProfileData] = useState({
        name: store?.ownerName || '',
        email: store?.email || '',
        phone: store?.phone || '',
    });

    // Bulk hours state
    const [bulkStart, setBulkStart] = useState('09:00');
    const [bulkEnd, setBulkEnd] = useState('18:00');
    const [bulkDays, setBulkDays] = useState<number[]>([1, 2, 3, 4, 5]);

    const [storeData, setStoreData] = useState({
        name: store?.name || '',
        slug: store?.slug || '',
        description: store?.description || '',
        address: store?.address || '',
        phone: store?.phone || '',
    });

    const [workingHours, setWorkingHours] = useState<WorkingHour[]>(() => {
        if (store?.workingHours && store.workingHours.length > 0) {
            return store.workingHours;
        }
        return [0, 1, 2, 3, 4, 5, 6].map(day => ({
            dayOfWeek: day,
            isOpen: day !== 0,
            openTime: '09:00',
            closeTime: day === 6 ? '14:00' : '18:00'
        }));
    });

    // Update store data when store changes
    useEffect(() => {
        if (store) {
            setStoreData({
                name: store.name || '',
                slug: store.slug || '',
                description: store.description || '',
                address: store.address || '',
                phone: store.phone || '',
            });

            if (store.workingHours && store.workingHours.length > 0) {
                setWorkingHours(store.workingHours);
            }
        }
        // Use user data for profile if available
        if (user) {
            setProfileData({
                name: user.ownerName || store?.ownerName || '',
                email: user.email || store?.email || '',
                phone: user.phone || store?.phone || '',
            });
        } else if (store) {
            setProfileData({
                name: store.ownerName || '',
                email: store.email || '',
                phone: store.phone || '',
            });
        }
    }, [store, user]);

    const [notifications, setNotifications] = useState({
        email: true,
        whatsapp: false,
        newBooking: true,
        cancellation: true,
        reminder: true,
    });

    // Domain management state
    const [customDomainInput, setCustomDomainInput] = useState(store?.customDomain || '');
    const [domainRecord, setDomainRecord] = useState<domainApi.DomainRecord | null>(null);
    const [isVerifyingDNS, setIsVerifyingDNS] = useState(false);
    const [isSavingDomain, setIsSavingDomain] = useState(false);
    const [domainError, setDomainError] = useState<string | null>(null);
    const [domainSuccess, setDomainSuccess] = useState<string | null>(null);

    // Load domain data on mount
    useEffect(() => {
        if (store?.id) {
            loadDomainData();
        }
    }, [store?.id]);

    const loadDomainData = async () => {
        if (!store?.id) return;
        const result = await domainApi.getStoreDomain(store.id);
        if (result.success && result.domain) {
            setDomainRecord(result.domain);
            setCustomDomainInput(result.domain.domain);
        }
    };

    const handleSaveDomain = async () => {
        if (!store?.id) return;

        setDomainError(null);
        setDomainSuccess(null);

        // Validate domain
        if (!domainApi.isValidDomain(customDomainInput)) {
            setDomainError('Formato de domínio inválido. Use algo como: minhaloja.com');
            return;
        }

        setIsSavingDomain(true);
        try {
            const result = await domainApi.addCustomDomain(store.id, customDomainInput);
            if (result.success && result.domain) {
                setDomainRecord(result.domain);
                setDomainSuccess('Domínio salvo! Configure o DNS conforme as instruções abaixo.');
            } else {
                setDomainError(result.error || 'Erro ao salvar domínio');
            }
        } catch (error: any) {
            setDomainError(error.message || 'Erro ao salvar domínio');
        } finally {
            setIsSavingDomain(false);
        }
    };

    const handleVerifyDNS = async () => {
        if (!domainRecord?.id) return;

        setIsVerifyingDNS(true);
        setDomainError(null);
        setDomainSuccess(null);

        try {
            const result = await domainApi.verifyDomainDNS(domainRecord.id);
            if (result.verified) {
                setDomainSuccess(result.message);
                await loadDomainData(); // Reload to get updated status
            } else {
                setDomainError(result.message);
            }
        } catch (error: any) {
            setDomainError(error.message || 'Erro ao verificar DNS');
        } finally {
            setIsVerifyingDNS(false);
        }
    };

    const handleDeleteDomain = async () => {
        if (!domainRecord?.id) return;

        if (!confirm('Tem certeza que deseja remover o domínio personalizado?')) return;

        try {
            const result = await domainApi.deleteCustomDomain(domainRecord.id);
            if (result.success) {
                setDomainRecord(null);
                setCustomDomainInput('');
                setDomainSuccess('Domínio removido com sucesso');
            } else {
                setDomainError(result.error || 'Erro ao remover domínio');
            }
        } catch (error: any) {
            setDomainError(error.message || 'Erro ao remover domínio');
        }
    };

    // Save customization
    const handleSaveCustomization = async () => {
        if (!customization) return;
        setIsSaving(true);
        try {
            const success = await saveStoreCustomization(customization);
            if (success) {
                alert('Personalização salva com sucesso!');
            } else {
                alert('Erro ao salvar personalização.');
            }
        } catch (error) {
            console.error('Error saving customization:', error);
            alert('Erro ao salvar personalização.');
        } finally {
            setIsSaving(false);
        }
    };

    // Reset customization
    const handleResetCustomization = async () => {
        if (!store?.id) return;
        if (confirm('Tem certeza que deseja resetar todas as personalizações?')) {
            try {
                const reset = await resetStoreCustomization(store.id);
                setCustomization(reset);
                alert('Personalizações resetadas!');
            } catch (error) {
                console.error('Error resetting customization:', error);
                alert('Erro ao resetar personalização.');
            }
        }
    };

    // Update customization field
    const updateCustomization = (field: keyof StoreCustomization, value: string | boolean | null) => {
        if (!customization) return;
        setCustomization({ ...customization, [field]: value });
    };

    // Handle color preset selection
    const handleColorPreset = (preset: typeof PRESET_COLORS[0]) => {
        if (!customization) return;
        setCustomization({
            ...customization,
            primaryColor: preset.primary,
            secondaryColor: preset.secondary,
            accentColor: preset.accent,
        });
    };

    // Handle image upload
    const handleImageUpload = async (type: 'logo' | 'coverImage', file: File) => {
        try {
            const base64 = await imageToBase64(file);
            updateCustomization(type, base64);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao carregar imagem. Tente novamente.');
        }
    };

    const handlePlanUpgrade = () => {
        if (!selectedPlan) return;
        if (selectedPlan === 'pro') {
            handleStripeCheckout();
        } else {
            // If they select 'free' (downgrade) via modal, we should probably guide them to the portal
            // or handle it via API if we support it directly. For now, redirect to portal.
            handleManageSubscription();
        }
    };

    // Save profile and store data
    const handleSave = async () => {
        if (!store?.id) return;

        setIsSaving(true);
        try {
            // Save store data and working hours in parallel
            const [settingsResult, hoursResult] = await Promise.all([
                storeApi.updateSettings(store.id, {
                    name: storeData.name,
                    slug: storeData.slug,
                    description: storeData.description,
                    address: storeData.address,
                    phone: storeData.phone,
                    email: profileData.email,
                }),
                storeApi.updateWorkingHours(store.id, workingHours)
            ]);

            if (settingsResult.success && hoursResult.success) {
                alert('Alterações salvas com sucesso!');
                // Optionally reload the page to refresh data
                window.location.reload();
            } else {
                alert('Erro ao salvar algumas alterações.');
            }
        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert(error.response?.data?.error || 'Erro ao salvar alterações.');
        } finally {
            setIsSaving(false);
        }
    };

    const copyStoreLink = () => {
        navigator.clipboard.writeText(`https://bookme.app/${storeData.slug}`);
        alert('Link copiado!');
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'domain', label: 'Domínio', icon: Globe },
        { id: 'appearance', label: 'Aparência', icon: Palette },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'plans', label: 'Planos', icon: CreditCard },
        { id: 'security', label: 'Segurança', icon: Shield },
    ];

    const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const applyBulkHours = () => {
        const newHours = [...workingHours];
        bulkDays.forEach(dayIndex => {
            const index = newHours.findIndex(h => h.dayOfWeek === dayIndex);
            if (index !== -1) {
                newHours[index] = {
                    ...newHours[index],
                    isOpen: true,
                    openTime: bulkStart,
                    closeTime: bulkEnd
                };
            }
        });
        setWorkingHours(newHours);
        alert('Horários aplicados aos dias selecionados! Lembre-se de clicar em "Salvar Alterações" no final da página.');
    };

    const toggleBulkDay = (dayIndex: number) => {
        if (bulkDays.includes(dayIndex)) {
            setBulkDays(bulkDays.filter(d => d !== dayIndex));
        } else {
            setBulkDays([...bulkDays, dayIndex]);
        }
    };

    const handleWorkingHourChange = (index: number, field: keyof WorkingHour, value: any) => {
        const updatedHours = [...workingHours];
        updatedHours[index] = {
            ...updatedHours[index],
            [field]: value
        };
        setWorkingHours(updatedHours);
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">Configurações</h1>
                <p className="page-subtitle">Gerencie sua conta e preferências</p>
            </div>

            {isAuthLoading || currentPlan === null ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4rem',
                    gap: '1rem',
                    color: 'var(--text-secondary)'
                }}>
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
                    <p>Carregando suas configurações...</p>
                </div>
            ) : (
                <>
                    <div className="settings-container">
                        {/* Sidebar Tabs */}
                        <div className="settings-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                >
                                    <tab.icon size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="settings-content">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="settings-section">
                                    <h2 className="section-title">Informações Pessoais</h2>
                                    <p className="section-subtitle">Atualize suas informações de perfil</p>

                                    <div className="profile-avatar-section">
                                        <div className="profile-avatar">
                                            {profileData.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                                        </div>
                                        <div className="avatar-actions">
                                            <Button variant="outline" size="sm">Alterar foto</Button>
                                            <span className="avatar-hint">JPG, PNG. Max 2MB</span>
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <Input
                                            label="Nome completo"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        />
                                        <Input
                                            label="Telefone"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="section-actions">
                                        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {/* Domain Tab - NEW */}
                            {activeTab === 'domain' && (
                                <div className="settings-section">
                                    <h2 className="section-title">Configuração de Domínio</h2>
                                    <p className="section-subtitle">Gerencie o endereço web da sua loja</p>

                                    {/* Free Tier - Subdomain */}
                                    <div className="domain-card" style={{
                                        background: 'linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        border: '1px solid var(--surface-200)',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: 'var(--success-100)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <CheckCircle size={20} style={{ color: 'var(--success-600)' }} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>Link Gratuito</h3>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    background: 'var(--success-100)',
                                                    color: 'var(--success-700)',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 500
                                                }}>Ativo</span>
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                            Seu link de agendamento gratuito incluso em todos os planos:
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            background: 'white',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--surface-200)'
                                        }}>
                                            <code style={{
                                                flex: 1,
                                                fontSize: '0.95rem',
                                                color: 'var(--primary-600)',
                                                fontWeight: 500
                                            }}>
                                                bookme.app/{storeData.slug || 'sua-loja'}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                leftIcon={<Copy size={14} />}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`https://bookme.app/${storeData.slug}`);
                                                    alert('Link copiado!');
                                                }}
                                            >
                                                Copiar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                leftIcon={<ExternalLink size={14} />}
                                                onClick={() => window.open(`/${storeData.slug}`, '_blank')}
                                            >
                                                Abrir
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Premium - Custom Domain */}
                                    <div className="domain-card" style={{
                                        background: store?.plan === 'free'
                                            ? 'linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%)'
                                            : 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        border: store?.plan === 'free'
                                            ? '1px solid var(--surface-200)'
                                            : '1px solid var(--primary-200)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {store?.plan === 'free' && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                background: 'var(--accent-500)',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                padding: '4px 12px',
                                                borderBottomLeftRadius: '8px'
                                            }}>
                                                PRO
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: store?.plan === 'free' ? 'var(--surface-200)' : 'var(--primary-200)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Globe size={20} style={{ color: store?.plan === 'free' ? 'var(--text-secondary)' : 'var(--primary-600)' }} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>Domínio Personalizado</h3>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    Use seu próprio domínio (ex: minhaloja.com)
                                                </span>
                                            </div>
                                        </div>

                                        {store?.plan === 'free' ? (
                                            <>
                                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                                    Tenha um endereço profissional com seu próprio domínio. Disponível nos planos pagos.
                                                </p>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => setActiveTab('plans')}
                                                    leftIcon={<Crown size={16} />}
                                                >
                                                    Fazer Upgrade para Usar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                {/* Error/Success Messages */}
                                                {domainError && (
                                                    <div style={{
                                                        background: 'var(--error-50)',
                                                        border: '1px solid var(--error-200)',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem 1rem',
                                                        marginBottom: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <XCircle size={16} style={{ color: 'var(--error-600)' }} />
                                                        <span style={{ fontSize: '0.9rem', color: 'var(--error-700)' }}>{domainError}</span>
                                                    </div>
                                                )}
                                                {domainSuccess && (
                                                    <div style={{
                                                        background: 'var(--success-50)',
                                                        border: '1px solid var(--success-200)',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem 1rem',
                                                        marginBottom: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <CheckCircle size={16} style={{ color: 'var(--success-600)' }} />
                                                        <span style={{ fontSize: '0.9rem', color: 'var(--success-700)' }}>{domainSuccess}</span>
                                                    </div>
                                                )}

                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <Input
                                                        label="Seu Domínio"
                                                        placeholder="clinicalacanianapsi.com"
                                                        value={customDomainInput}
                                                        onChange={(e) => setCustomDomainInput(e.target.value)}
                                                        hint="Domínio sem http:// ou www"
                                                    />
                                                </div>

                                                {/* Verification Status */}
                                                <div style={{
                                                    background: domainRecord?.verified ? 'var(--success-50)' : 'var(--warning-50)',
                                                    border: `1px solid ${domainRecord?.verified ? 'var(--success-200)' : 'var(--warning-200)'}`,
                                                    borderRadius: '8px',
                                                    padding: '1rem',
                                                    marginBottom: '1.5rem'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        {domainRecord?.verified ? (
                                                            <CheckCircle size={18} style={{ color: 'var(--success-600)' }} />
                                                        ) : (
                                                            <AlertCircle size={18} style={{ color: 'var(--warning-600)' }} />
                                                        )}
                                                        <strong style={{ color: domainRecord?.verified ? 'var(--success-700)' : 'var(--warning-700)' }}>
                                                            {domainRecord?.verified ? 'Domínio Verificado' : domainRecord ? 'Verificação Pendente' : 'Configure seu domínio'}
                                                        </strong>
                                                    </div>
                                                    {!domainRecord?.verified && (
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--warning-700)', margin: 0 }}>
                                                            {domainRecord
                                                                ? 'Configure o DNS do seu domínio conforme as instruções abaixo.'
                                                                : 'Insira seu domínio e clique em "Salvar Domínio" para começar.'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* DNS Instructions */}
                                                {domainRecord && (
                                                    <div style={{
                                                        background: 'white',
                                                        border: '1px solid var(--surface-200)',
                                                        borderRadius: '8px',
                                                        padding: '1.25rem'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                            <Info size={16} style={{ color: 'var(--primary-600)' }} />
                                                            <strong style={{ fontSize: '0.95rem' }}>Instruções de Configuração DNS</strong>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                                            Acesse o painel do seu registrador de domínio e adicione o seguinte registro:
                                                        </p>
                                                        <div style={{
                                                            background: 'var(--surface-50)',
                                                            borderRadius: '6px',
                                                            padding: '1rem',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                <span style={{ color: 'var(--text-secondary)' }}>Tipo:</span>
                                                                <span style={{ fontWeight: 600 }}>CNAME</span>
                                                                <span></span>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                <span style={{ color: 'var(--text-secondary)' }}>Nome:</span>
                                                                <span style={{ fontWeight: 600 }}>@</span>
                                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(ou deixe vazio)</span>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem' }}>
                                                                <span style={{ color: 'var(--text-secondary)' }}>Valor:</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>cname.vercel-dns.com</span>
                                                            </div>
                                                        </div>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
                                                            ⏱️ A propagação do DNS pode levar até 48 horas.
                                                        </p>
                                                    </div>
                                                )}

                                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    {domainRecord ? (
                                                        <>
                                                            <Button
                                                                variant="primary"
                                                                leftIcon={isVerifyingDNS ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                                                onClick={handleVerifyDNS}
                                                                disabled={isVerifyingDNS}
                                                            >
                                                                {isVerifyingDNS ? 'Verificando...' : 'Verificar DNS'}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={handleDeleteDomain}
                                                            >
                                                                Remover Domínio
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleSaveDomain}
                                                            disabled={isSavingDomain || !customDomainInput}
                                                            leftIcon={isSavingDomain ? <Loader2 size={16} className="animate-spin" /> : undefined}
                                                        >
                                                            {isSavingDomain ? 'Salvando...' : 'Salvar Domínio'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <div style={{
                                        background: 'var(--info-50)',
                                        border: '1px solid var(--info-200)',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        display: 'flex',
                                        gap: '0.75rem'
                                    }}>
                                        <Info size={20} style={{ color: 'var(--info-600)', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <strong style={{ color: 'var(--info-700)', display: 'block', marginBottom: '0.25rem' }}>
                                                Como funciona?
                                            </strong>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--info-700)', margin: 0 }}>
                                                Ao configurar um domínio personalizado, seus clientes poderão acessar <strong>seudominio.com</strong> diretamente,
                                                em vez de bookme.app/sua-loja. Isso transmite mais profissionalismo e fortalece sua marca.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Tab - Visual Editor */}
                            {activeTab === 'appearance' && (
                                <div className="settings-section">
                                    <div style={{
                                        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
                                        padding: '3rem',
                                        borderRadius: '1rem',
                                        border: '1px solid var(--primary-200)',
                                        textAlign: 'center'
                                    }}>
                                        <Palette size={48} style={{ color: 'var(--primary-600)', marginBottom: '1rem' }} />
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                            Editor Visual de Loja
                                        </h2>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                                            Personalize as cores, fontes, layout e imagens da sua loja com nossa nova experiência de edição visual em tempo real. Você vê exatamente como vai ficar!
                                        </p>
                                        <Button
                                            onClick={() => navigate('/app/editor')}
                                            variant="primary"
                                        >
                                            Abrir Editor Visual
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="settings-section">
                                    <h2 className="section-title">Preferências de Notificação</h2>
                                    <p className="section-subtitle">Configure como você deseja receber notificações</p>

                                    <div className="notification-group">
                                        <h3 className="notification-group-title">Canais</h3>
                                        <div className="notification-options">
                                            <label className="notification-option">
                                                <div className="option-info">
                                                    <span className="option-title">Email</span>
                                                    <span className="option-desc">Receba notificações por email</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.email}
                                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                                />
                                            </label>
                                            <label className="notification-option">
                                                <div className="option-info">
                                                    <span className="option-title">
                                                        WhatsApp
                                                        {currentPlan === 'free' && <span className="pro-badge">PRO</span>}
                                                    </span>
                                                    <span className="option-desc">Receba notificações via WhatsApp</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.whatsapp}
                                                    onChange={(e) => setNotifications({ ...notifications, whatsapp: e.target.checked })}
                                                    disabled={currentPlan === 'free'}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="notification-group">
                                        <h3 className="notification-group-title">Eventos</h3>
                                        <div className="notification-options">
                                            <label className="notification-option">
                                                <div className="option-info">
                                                    <span className="option-title">Novo agendamento</span>
                                                    <span className="option-desc">Quando um cliente agendar</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.newBooking}
                                                    onChange={(e) => setNotifications({ ...notifications, newBooking: e.target.checked })}
                                                />
                                            </label>
                                            <label className="notification-option">
                                                <div className="option-info">
                                                    <span className="option-title">Cancelamento</span>
                                                    <span className="option-desc">Quando um agendamento for cancelado</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.cancellation}
                                                    onChange={(e) => setNotifications({ ...notifications, cancellation: e.target.checked })}
                                                />
                                            </label>
                                            <label className="notification-option">
                                                <div className="option-info">
                                                    <span className="option-title">Lembretes</span>
                                                    <span className="option-desc">Lembretes de próximos atendimentos</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.reminder}
                                                    onChange={(e) => setNotifications({ ...notifications, reminder: e.target.checked })}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="section-actions">
                                        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                                            Salvar Preferências
                                        </Button>
                                    </div>
                                </div>
                            )
                            }

                            {/* Plans Tab */}
                            {
                                activeTab === 'plans' && (
                                    <div className="settings-section">
                                        <h2 className="section-title">Seu Plano</h2>
                                        <p className="section-subtitle">Gerencie sua assinatura e benefícios</p>

                                        {/* Current Plan Card */}
                                        <div className="current-plan-card">
                                            {subscriptionStatus?.cancelAtPeriodEnd && (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                                                    <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                                                    <div>
                                                        <h4 className="font-semibold text-orange-700 text-sm">Cancelamento Agendado</h4>
                                                        <p className="text-orange-600 text-sm mt-1">
                                                            Seu plano será cancelado automaticamente em {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}.
                                                            Até lá, você continua com acesso total aos recursos.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2 border-orange-200 text-orange-700 hover:bg-orange-100"
                                                            onClick={handleManageSubscription}
                                                        >
                                                            Reativar Assinatura
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="current-plan-info">
                                                <div className={`current-plan-badge ${subscriptionStatus?.cancelAtPeriodEnd ? 'cancelling' : ''}`}>
                                                    {currentPlan === 'free' ? <Zap size={18} /> : <Crown size={18} />}
                                                    <span>
                                                        {currentPlan === 'free' ? 'Starter' : 'Profissional'}
                                                        {subscriptionStatus?.cancelAtPeriodEnd && ' (Encerrando em breve)'}
                                                    </span>
                                                </div>
                                                <p className="current-plan-desc">
                                                    {subscriptionStatus?.cancelAtPeriodEnd
                                                        ? `Seu plano ${currentPlan === 'free' ? 'Starter' : 'Profissional'} está ativo até o fim do período, mas não será renovado.`
                                                        : currentPlan === 'free'
                                                            ? 'Você está no plano gratuito. Faça upgrade para desbloquear mais recursos!'
                                                            : 'Você tem acesso a todos os recursos do seu plano.'
                                                    }
                                                </p>
                                            </div>
                                            {currentPlan === 'free' && (
                                                <Button variant="primary" onClick={() => setIsPlanModalOpen(true)}>
                                                    Fazer Upgrade
                                                </Button>
                                            )}
                                        </div>

                                        {/* Store Link */}
                                        <div className="store-link-card" style={{ marginTop: '1.5rem' }}>
                                            <div className="store-link-info">
                                                <span className="store-link-label">Seu link de agendamento:</span>
                                                <a href={`/${storeData.slug}`} className="store-link" target="_blank">
                                                    bookme.app/{storeData.slug}
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                            <Button variant="outline" size="sm" leftIcon={<Copy size={14} />} onClick={copyStoreLink}>
                                                Copiar
                                            </Button>
                                        </div>

                                        {/* Plans Grid */}
                                        <div className="plans-grid">
                                            {PLANS.map(plan => (
                                                <div
                                                    key={plan.id}
                                                    className={`plan-card ${plan.id === currentPlan ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
                                                >
                                                    {plan.popular && <div className="popular-badge">Mais Popular</div>}
                                                    <div className="plan-header">
                                                        <h3 className="plan-name">{plan.name}</h3>
                                                        <div className="plan-price">
                                                            {plan.price === 0 ? (
                                                                <span className="price-amount">Grátis</span>
                                                            ) : (
                                                                <>
                                                                    <span className="price-currency">R$</span>
                                                                    <span className="price-amount">{plan.price}</span>
                                                                    <span className="price-period">{plan.period}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <p className="plan-desc">{plan.description}</p>
                                                    </div>
                                                    <ul className="plan-features">
                                                        {plan.features.map(feature => (
                                                            <li key={feature}>
                                                                <Check size={16} className="feature-check" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {plan.id !== currentPlan && plan.id === 'pro' && (
                                                        <Button
                                                            variant="primary"
                                                            fullWidth
                                                            onClick={() => handleMercadoPagoCheckout('professional')}
                                                            isLoading={isCheckoutLoading}
                                                        >
                                                            Assinar Agora
                                                        </Button>
                                                    )}
                                                    {plan.id !== currentPlan && plan.id === 'free' && currentPlan !== 'free' && (
                                                        <Button
                                                            variant="outline"
                                                            fullWidth
                                                            onClick={handleManageSubscription}
                                                            isLoading={isCheckoutLoading}
                                                        >
                                                            Fazer Downgrade
                                                        </Button>
                                                    )}
                                                    {plan.id === currentPlan && (
                                                        <>
                                                            <div className="current-badge">Plano Atual</div>
                                                            {currentPlan === 'pro' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={handleManageSubscription}
                                                                    isLoading={isCheckoutLoading}
                                                                    style={{ marginTop: '0.5rem' }}
                                                                >
                                                                    Gerenciar Assinatura
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Payment Message */}
                                        {paymentMessage && (
                                            <div
                                                className={`payment-message ${paymentMessage.type}`}
                                                style={{
                                                    marginTop: '1.5rem',
                                                    padding: '1rem',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    background: paymentMessage.type === 'success' ? 'var(--success-50)' : 'var(--error-50)',
                                                    border: `1px solid ${paymentMessage.type === 'success' ? 'var(--success-200)' : 'var(--error-200)'}`,
                                                }}
                                            >
                                                {paymentMessage.type === 'success' ? (
                                                    <CheckCircle size={20} style={{ color: 'var(--success-600)' }} />
                                                ) : (
                                                    <XCircle size={20} style={{ color: 'var(--error-600)' }} />
                                                )}
                                                <span style={{ color: paymentMessage.type === 'success' ? 'var(--success-700)' : 'var(--error-700)' }}>
                                                    {paymentMessage.text}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            {/* Security Tab */}
                            {
                                activeTab === 'security' && (
                                    <div className="settings-section">
                                        <h2 className="section-title">Segurança</h2>
                                        <p className="section-subtitle">Gerencie sua senha e segurança da conta</p>

                                        <div className="security-section">
                                            <h3 className="security-title">Alterar Senha</h3>
                                            <div className="form-grid">
                                                <Input
                                                    label="Senha Atual"
                                                    type="password"
                                                    placeholder="••••••••"
                                                />
                                                <Input
                                                    label="Nova Senha"
                                                    type="password"
                                                    placeholder="••••••••"
                                                />
                                                <Input
                                                    label="Confirmar Nova Senha"
                                                    type="password"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="security-section danger">
                                            <h3 className="security-title">Zona de Perigo</h3>
                                            <p className="security-desc">
                                                Cuidado! Estas ações não podem ser desfeitas.
                                            </p>
                                            <div className="danger-actions">
                                                <Button variant="outline" onClick={() => setIsDeactivateModalOpen(true)}>Desativar Conta</Button>
                                                <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Excluir Conta</Button>
                                            </div>
                                        </div>

                                        <div className="section-actions">
                                            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                                                Atualizar Senha
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }
                        </div >
                    </div >

                    {/* Plan Upgrade Modal */}
                    <Modal
                        isOpen={isPlanModalOpen}
                        onClose={() => setIsPlanModalOpen(false)}
                        title={selectedPlan === 'free' ? "Alterar para Plano Grátis" : "Confirmar Upgrade"}
                        description={selectedPlan === 'free'
                            ? "Para cancelar sua assinatura atual e voltar ao plano gratuito, você será redirecionado para o Portal do Stripe."
                            : `Você está prestes a assinar o plano ${PLANS.find(p => p.id === selectedPlan)?.name}`
                        }
                    >
                        <div className="upgrade-modal-content">
                            {selectedPlan !== 'free' && (
                                <div className="upgrade-summary">
                                    <div className="upgrade-plan-name">{PLANS.find(p => p.id === selectedPlan)?.name}</div>
                                    <div className="upgrade-price">
                                        R$ {PLANS.find(p => p.id === selectedPlan)?.price}/mês
                                    </div>
                                </div>
                            )}
                            <p className="upgrade-note">
                                {selectedPlan === 'free'
                                    ? "No Portal da Stripe, você poderá gerenciar sua assinatura e interromper as cobranças."
                                    : "Você será redirecionado para a página de pagamento seguro."
                                }
                            </p>
                            <div className="modal-actions">
                                <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" onClick={handlePlanUpgrade} isLoading={isCheckoutLoading}>
                                    {selectedPlan === 'free' ? 'Ir para o Portal Stripe' : 'Confirmar Upgrade'}
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Deactivate Account Modal */}
                    <Modal
                        isOpen={isDeactivateModalOpen}
                        onClose={() => setIsDeactivateModalOpen(false)}
                        title="Desativar Conta"
                        description="Tem certeza que deseja desativar sua conta?"
                    >
                        <div className="upgrade-modal-content">
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Sua loja ficará offline e você não poderá receber novos agendamentos.
                                Você pode reativar sua conta entrando em contato com o suporte.
                            </p>
                            <div className="modal-actions">
                                <Button variant="outline" onClick={() => setIsDeactivateModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="danger" onClick={handleDeactivateAccount}>
                                    Confirmar Desativação
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {/* Delete Account Modal */}
                    <Modal
                        isOpen={isDeleteModalOpen}
                        onClose={() => { setIsDeleteModalOpen(false); setDeleteConfirmText(''); }}
                        title="Excluir Conta Permanentemente"
                        description="Esta ação é irreversível!"
                    >
                        <div className="upgrade-modal-content">
                            <p style={{ color: 'var(--error-600)', fontWeight: 500, marginBottom: '1rem' }}>
                                ⚠️ Todos os seus dados serão excluídos permanentemente, incluindo:
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                                <li>Informações da loja</li>
                                <li>Histórico de agendamentos</li>
                                <li>Base de clientes</li>
                                <li>Configurações e personalizações</li>
                            </ul>
                            <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
                                Para confirmar, digite <strong>EXCLUIR</strong> abaixo:
                            </p>
                            <Input
                                placeholder="Digite EXCLUIR"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                            />
                            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                                <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmText(''); }}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'EXCLUIR'}
                                >
                                    Excluir Permanentemente
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </>
            )}

            {/* Mercado Pago Checkout Modal */}
            {showMPCheckout && selectedPlanForCheckout && (
                <MercadoPagoCheckout
                    plan={selectedPlanForCheckout}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onClose={() => {
                        setShowMPCheckout(false);
                        setSelectedPlanForCheckout(null);
                    }}
                />
            )}
        </div >
    );
};

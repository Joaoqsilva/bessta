import { useState, useEffect } from 'react';
import {
    Settings, Save, Bell, Mail, Shield, Globe,
    Palette, DollarSign, Users, CheckCircle, User, Lock, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { platformSettingsApi, platformManagementApi } from '../../services/platformApi';
import type { PlatformSettings as IPlatformSettings } from '../../services/platformApi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { showError } from '../../utils/toast';
import './MasterSettingsPage.css';

interface PlatformSettings {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    supportPhone: string;
    // Notifications
    emailNotifications: boolean;
    newStoreAlerts: boolean;
    complaintAlerts: boolean;
    // Plans
    freePlanLimit: number;
    basicPlanPrice: number;
    proPlanPrice: number;
    // Security
    requireEmailVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
}

const defaultSettings: PlatformSettings = {
    siteName: 'SimpliAgenda',
    siteDescription: 'Plataforma de agendamentos online para negócios locais',
    supportEmail: 'suporte@simpliagenda.com.br',
    supportPhone: '(47) 99139-4589',
    emailNotifications: true,
    newStoreAlerts: true,
    complaintAlerts: true,
    freePlanLimit: 50,
    basicPlanPrice: 49,
    proPlanPrice: 99,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 60,
};

export const MasterSettingsPage = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSaved, setShowSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'plans' | 'security' | 'account'>('general');

    // Account settings state
    const [accountForm, setAccountForm] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isAccountSaving, setIsAccountSaving] = useState(false);

    // Email test state
    const [testEmail, setTestEmail] = useState('');
    const [testEmailStatus, setTestEmailStatus] = useState<{ type: 'success' | 'error' | 'loading', text: string } | null>(null);

    useEffect(() => {
        loadSettings();
        if (user?.email) {
            setAccountForm(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await platformSettingsApi.getSettings();
            setSettings({ ...defaultSettings, ...data });
        } catch (error) {
            console.error('Error loading settings:', error);
            // Use default settings on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await platformSettingsApi.updateSettings(settings);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            showError('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAccountUpdate = async (type: 'email' | 'password') => {
        setIsAccountSaving(true);
        setAccountMessage(null);

        try {
            if (type === 'email') {
                if (!accountForm.email || !accountForm.currentPassword) {
                    setAccountMessage({ type: 'error', text: 'Preencha o novo email e sua senha atual' });
                    return;
                }
                await api.patch('/api/auth/update-email', {
                    newEmail: accountForm.email,
                    password: accountForm.currentPassword
                });
                setAccountMessage({ type: 'success', text: 'Email atualizado com sucesso!' });
            } else {
                if (!accountForm.currentPassword || !accountForm.newPassword) {
                    setAccountMessage({ type: 'error', text: 'Preencha a senha atual e a nova senha' });
                    return;
                }
                if (accountForm.newPassword !== accountForm.confirmPassword) {
                    setAccountMessage({ type: 'error', text: 'As senhas não coincidem' });
                    return;
                }
                if (accountForm.newPassword.length < 6) {
                    setAccountMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
                    return;
                }
                await api.patch('/api/auth/update-password', {
                    currentPassword: accountForm.currentPassword,
                    newPassword: accountForm.newPassword
                });
                setAccountMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
                setAccountForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            }
        } catch (error: any) {
            setAccountMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao atualizar' });
        } finally {
            setIsAccountSaving(false);
        }
    };

    const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            setTestEmailStatus({ type: 'error', text: 'Digite um email para teste' });
            return;
        }
        setTestEmailStatus({ type: 'loading', text: 'Enviando email de teste...' });

        const result = await platformManagementApi.sendTestEmail(testEmail);

        if (result.success) {
            setTestEmailStatus({ type: 'success', text: result.message || 'Email enviado com sucesso!' });
        } else {
            setTestEmailStatus({ type: 'error', text: result.error || 'Falha ao enviar email' });
        }
    };

    const tabs = [
        { id: 'account', label: 'Minha Conta', icon: User },
        { id: 'general', label: 'Geral', icon: Globe },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'plans', label: 'Planos', icon: DollarSign },
        { id: 'security', label: 'Segurança', icon: Shield },
    ];

    return (
        <div className="master-settings-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configurações da Plataforma</h1>
                    <p className="page-subtitle">Gerencie as configurações gerais do sistema</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={isSaving ? undefined : <Save size={18} />}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            {showSaved && (
                <div className="save-notification">
                    <CheckCircle size={18} />
                    Configurações salvas com sucesso!
                </div>
            )}

            <div className="settings-container">
                {/* Tabs */}
                <div className="settings-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id as any)}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="settings-content">
                    {activeTab === 'account' && (
                        <div className="settings-section">
                            <h2 className="section-title">
                                <User size={20} />
                                Minha Conta
                            </h2>
                            <p className="section-description">
                                Altere seu email e senha de acesso
                            </p>

                            {accountMessage && (
                                <div className={`account-message ${accountMessage.type}`}>
                                    {accountMessage.type === 'success' ? <CheckCircle size={18} /> : <Shield size={18} />}
                                    {accountMessage.text}
                                </div>
                            )}

                            <div className="settings-form">
                                {/* Email Section */}
                                <div className="account-section">
                                    <h3><Mail size={18} /> Alterar Email</h3>
                                    <div className="form-group">
                                        <label>Novo Email</label>
                                        <Input
                                            type="email"
                                            value={accountForm.email}
                                            onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="novo@email.com"
                                            leftIcon={<Mail size={18} />}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Senha Atual (para confirmar)</label>
                                        <div className="password-input-wrapper">
                                            <Input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={accountForm.currentPassword}
                                                onChange={(e) => setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                leftIcon={<Lock size={18} />}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                            >
                                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleAccountUpdate('email')}
                                        disabled={isAccountSaving}
                                    >
                                        {isAccountSaving ? 'Salvando...' : 'Atualizar Email'}
                                    </Button>
                                </div>

                                {/* Password Section */}
                                <div className="account-section">
                                    <h3><Lock size={18} /> Alterar Senha</h3>
                                    <div className="form-group">
                                        <label>Senha Atual</label>
                                        <div className="password-input-wrapper">
                                            <Input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={accountForm.currentPassword}
                                                onChange={(e) => setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                leftIcon={<Lock size={18} />}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Nova Senha</label>
                                        <div className="password-input-wrapper">
                                            <Input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={accountForm.newPassword}
                                                onChange={(e) => setAccountForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                leftIcon={<Lock size={18} />}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                            >
                                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Confirmar Nova Senha</label>
                                        <div className="password-input-wrapper">
                                            <Input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={accountForm.confirmPassword}
                                                onChange={(e) => setAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                leftIcon={<Lock size={18} />}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            >
                                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleAccountUpdate('password')}
                                        disabled={isAccountSaving}
                                    >
                                        {isAccountSaving ? 'Salvando...' : 'Atualizar Senha'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <h2 className="section-title">
                                <Globe size={20} />
                                Configurações Gerais
                            </h2>
                            <p className="section-description">
                                Informações básicas da plataforma
                            </p>

                            <div className="settings-form">
                                <div className="form-group">
                                    <label>Nome da Plataforma</label>
                                    <Input
                                        value={settings.siteName}
                                        onChange={(e) => updateSetting('siteName', e.target.value)}
                                        placeholder="Nome do site"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descrição</label>
                                    <textarea
                                        value={settings.siteDescription}
                                        onChange={(e) => updateSetting('siteDescription', e.target.value)}
                                        placeholder="Descrição do site"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email de Suporte</label>
                                        <Input
                                            type="email"
                                            value={settings.supportEmail}
                                            onChange={(e) => updateSetting('supportEmail', e.target.value)}
                                            placeholder="suporte@email.com"
                                            leftIcon={<Mail size={18} />}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Telefone de Suporte</label>
                                        <Input
                                            value={settings.supportPhone}
                                            onChange={(e) => updateSetting('supportPhone', e.target.value)}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h2 className="section-title">
                                <Bell size={20} />
                                Configurações de Notificações
                            </h2>
                            <p className="section-description">
                                Gerencie alertas e notificações do sistema
                            </p>

                            <div className="settings-form">
                                <div className="toggle-group">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Notificações por Email</span>
                                        <span className="toggle-description">Receber notificações importantes por email</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-group">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Alertas de Novas Lojas</span>
                                        <span className="toggle-description">Notificar quando uma nova loja se registrar</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.newStoreAlerts}
                                            onChange={(e) => updateSetting('newStoreAlerts', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-group">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Alertas de Reclamações</span>
                                        <span className="toggle-description">Notificar quando uma nova reclamação for registrada</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.complaintAlerts}
                                            onChange={(e) => updateSetting('complaintAlerts', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                {/* Test Email Section */}
                                <div className="test-email-section" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Mail size={18} />
                                        Testar Configuração de Email
                                    </h3>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        Envie um email de teste para verificar se o Brevo está configurado corretamente.
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <Input
                                            type="email"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            placeholder="Digite seu email para teste"
                                            leftIcon={<Mail size={18} />}
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={handleTestEmail}
                                            disabled={testEmailStatus?.type === 'loading'}
                                        >
                                            {testEmailStatus?.type === 'loading' ? 'Enviando...' : 'Enviar Teste'}
                                        </Button>
                                    </div>
                                    {testEmailStatus && testEmailStatus.type !== 'loading' && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            background: testEmailStatus.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: testEmailStatus.type === 'success' ? '#22c55e' : '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {testEmailStatus.type === 'success' ? <CheckCircle size={18} /> : <Shield size={18} />}
                                            {testEmailStatus.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'plans' && (
                        <div className="settings-section">
                            <h2 className="section-title">
                                <DollarSign size={20} />
                                Configurações de Planos
                            </h2>
                            <p className="section-description">
                                Defina limites e preços dos planos
                            </p>

                            <div className="settings-form">
                                <div className="plan-card free">
                                    <h3>Plano Grátis</h3>
                                    <div className="form-group">
                                        <label>Limite de Agendamentos por Mês</label>
                                        <Input
                                            type="number"
                                            value={settings.freePlanLimit}
                                            onChange={(e) => updateSetting('freePlanLimit', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="plan-card basic">
                                    <h3>Plano Profissional</h3>
                                    <div className="form-group">
                                        <label>Preço Mensal (R$)</label>
                                        <Input
                                            type="number"
                                            value={settings.basicPlanPrice}
                                            onChange={(e) => updateSetting('basicPlanPrice', parseInt(e.target.value))}
                                            leftIcon={<DollarSign size={18} />}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h2 className="section-title">
                                <Shield size={20} />
                                Configurações de Segurança
                            </h2>
                            <p className="section-description">
                                Gerencie políticas de segurança da plataforma
                            </p>

                            <div className="settings-form">
                                <div className="toggle-group">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Verificação de Email Obrigatória</span>
                                        <span className="toggle-description">Exigir verificação de email para novas contas</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={settings.requireEmailVerification}
                                            onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Máximo de Tentativas de Login</label>
                                        <Input
                                            type="number"
                                            value={settings.maxLoginAttempts}
                                            onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                                        />
                                        <span className="form-hint">Após esse número, a conta será bloqueada temporariamente</span>
                                    </div>
                                    <div className="form-group">
                                        <label>Timeout de Sessão (minutos)</label>
                                        <Input
                                            type="number"
                                            value={settings.sessionTimeout}
                                            onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                                        />
                                        <span className="form-hint">Tempo de inatividade antes do logout automático</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

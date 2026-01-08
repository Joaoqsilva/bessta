import { useState, useEffect } from 'react';
import {
    Settings, Save, Bell, Mail, Shield, Globe,
    Palette, DollarSign, Users, CheckCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
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
    siteName: 'Bessta',
    siteDescription: 'Plataforma de agendamentos online para negócios locais',
    supportEmail: 'suporte@bessta.com',
    supportPhone: '(11) 99999-9999',
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
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'plans' | 'security'>('general');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        const stored = localStorage.getItem('platform_settings');
        if (stored) {
            setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem('platform_settings', JSON.stringify(settings));
            setIsSaving(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 3000);
        }, 500);
    };

    const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const tabs = [
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

                                <div className="plan-card pro">
                                    <h3>Plano Enterprise</h3>
                                    <div className="form-group">
                                        <label>Preço Mensal (R$)</label>
                                        <Input
                                            type="number"
                                            value={settings.proPlanPrice}
                                            onChange={(e) => updateSetting('proPlanPrice', parseInt(e.target.value))}
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

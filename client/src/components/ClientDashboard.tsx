// ========================================
// CLIENT DASHBOARD COMPONENT
// Panel for logged-in users to view their appointments and settings
// ========================================

import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Mail,
    Phone,
    Settings,
    ChevronRight,
    X,
    Loader,
    CalendarCheck,
    History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Appointment } from '../types';
import './ClientDashboard.css';

interface ClientDashboardProps {
    storeId: string;
    storeName: string;
    onClose: () => void;
    onBook?: () => void;
}

type TabType = 'appointments' | 'settings';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
    pending: { label: 'Pendente', color: '#f59e0b', icon: AlertCircle, bgColor: 'rgba(245, 158, 11, 0.1)' },
    confirmed: { label: 'Confirmada', color: '#10b981', icon: CheckCircle2, bgColor: 'rgba(16, 185, 129, 0.1)' },
    in_progress: { label: 'Em Andamento', color: '#3b82f6', icon: Clock, bgColor: 'rgba(59, 130, 246, 0.1)' },
    completed: { label: 'Concluída', color: '#6b7280', icon: CheckCircle2, bgColor: 'rgba(107, 114, 128, 0.1)' },
    cancelled: { label: 'Cancelada', color: '#ef4444', icon: XCircle, bgColor: 'rgba(239, 68, 68, 0.1)' },
    no_show: { label: 'Não Compareceu', color: '#ef4444', icon: XCircle, bgColor: 'rgba(239, 68, 68, 0.1)' },
};

export const ClientDashboard = ({ storeId, storeName, onClose, onBook }: ClientDashboardProps) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('appointments');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state for settings
    const [formData, setFormData] = useState({
        name: user?.ownerName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            fetchMyAppointments();
        }
    }, [user, storeId]);

    const fetchMyAppointments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/appointments/my?storeId=${storeId}`);
            if (response.data.success) {
                setAppointments(response.data.appointments || []);
            }
        } catch (err: any) {
            console.error('Error fetching appointments:', err);
            setError('Não foi possível carregar suas consultas.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage(null);

        try {
            await api.put('/auth/profile', {
                ownerName: formData.name,
                phone: formData.phone,
            });
            setSaveMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setSaveMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Helper to extract time from ISO date or use time field
    const getTimeFromAppointment = (apt: any): string => {
        try {
            if (!apt) return '--:--';
            // If time field exists, use it
            if (apt.time) return apt.time.substring(0, 5);
            // Otherwise extract from date ISO
            if (apt.date) {
                const date = new Date(apt.date);
                if (isNaN(date.getTime())) return '--:--';
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }
            return '--:--';
        } catch (e) {
            console.error('Error parsing time for appointment:', apt, e);
            return '--:--';
        }
    };

    const getEndTimeFromAppointment = (apt: any): string => {
        try {
            if (!apt) return '';
            if (apt.endTime) return apt.endTime.substring(0, 5);
            if (apt.endDate) {
                const date = new Date(apt.endDate);
                if (isNaN(date.getTime())) return '';
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }
            return '';
        } catch (e) {
            console.error('Error parsing end time:', e);
            return '';
        }
    };

    // Separate upcoming and past appointments
    // Separate upcoming and past appointments
    const now = new Date();
    const upcomingAppointments = appointments.filter(apt => {
        if (!apt || !apt.date) return false;
        const aptDate = new Date(apt.date);
        return !isNaN(aptDate.getTime()) && aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'no_show';
    }).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    const pastAppointments = appointments.filter(apt => {
        if (!apt || !apt.date) return false;
        const aptDate = new Date(apt.date);
        return !isNaN(aptDate.getTime()) && (aptDate < now || apt.status === 'cancelled' || apt.status === 'no_show');
    }).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });

    return (
        <div className="client-dashboard-overlay" onClick={onClose}>
            <div className="client-dashboard" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="client-dashboard-header">
                    <div className="client-dashboard-header-info">
                        <h2>Minha Área</h2>
                        <p>Olá, {user?.ownerName || user?.name || 'Cliente'}!</p>
                    </div>
                    <button className="client-dashboard-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="client-dashboard-tabs">
                    <button
                        className={`client-dashboard-tab ${activeTab === 'appointments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appointments')}
                    >
                        <Calendar size={18} />
                        <span>Minhas Consultas</span>
                    </button>
                    <button
                        className={`client-dashboard-tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={18} />
                        <span>Configurações</span>
                    </button>
                </div>

                {/* Content */}
                <div className="client-dashboard-content">
                    {activeTab === 'appointments' && (
                        <div className="appointments-tab">
                            {isLoading ? (
                                <div className="loading-state">
                                    <Loader className="spinner" size={32} />
                                    <p>Carregando suas consultas...</p>
                                </div>
                            ) : error ? (
                                <div className="error-state">
                                    <AlertCircle size={32} />
                                    <p>{error}</p>
                                    <button onClick={fetchMyAppointments}>Tentar novamente</button>
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="empty-state">
                                    <CalendarCheck size={48} />
                                    <h3>Nenhuma consulta encontrada</h3>
                                    <p>Você ainda não agendou nenhuma consulta em {storeName}.</p>
                                    {onBook && (
                                        <button className="book-now-btn" onClick={() => { onClose(); onBook(); }}>
                                            Agendar Agora
                                            <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Upcoming Appointments */}
                                    {upcomingAppointments.length > 0 && (
                                        <div className="appointments-section">
                                            <h3 className="section-title">
                                                <CalendarCheck size={18} />
                                                Próximas Consultas
                                            </h3>
                                            <div className="appointments-list">
                                                {upcomingAppointments.map((apt) => {
                                                    const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                                                    const StatusIcon = status.icon;
                                                    return (
                                                        <div key={apt.id || apt._id} className="appointment-card upcoming">
                                                            <div className="appointment-date-badge">
                                                                <span className="day">{new Date(apt.date).getDate()}</span>
                                                                <span className="month">{new Date(apt.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                                            </div>
                                                            <div className="appointment-details">
                                                                <h4>{apt.serviceName}</h4>
                                                                <div className="appointment-meta">
                                                                    <span className="time">
                                                                        <Clock size={14} />
                                                                        {getTimeFromAppointment(apt)} - {getEndTimeFromAppointment(apt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="appointment-status"
                                                                style={{
                                                                    color: status.color,
                                                                    backgroundColor: status.bgColor
                                                                }}
                                                            >
                                                                <StatusIcon size={14} />
                                                                <span>{status.label}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Past Appointments */}
                                    {pastAppointments.length > 0 && (
                                        <div className="appointments-section past">
                                            <h3 className="section-title">
                                                <History size={18} />
                                                Histórico
                                            </h3>
                                            <div className="appointments-list">
                                                {pastAppointments.slice(0, 5).map((apt) => {
                                                    const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.completed;
                                                    const StatusIcon = status.icon;
                                                    return (
                                                        <div key={apt.id || apt._id} className="appointment-card past">
                                                            <div className="appointment-date-badge muted">
                                                                <span className="day">{new Date(apt.date).getDate()}</span>
                                                                <span className="month">{new Date(apt.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                                            </div>
                                                            <div className="appointment-details">
                                                                <h4>{apt.serviceName}</h4>
                                                                <div className="appointment-meta">
                                                                    <span className="time">
                                                                        <Clock size={14} />
                                                                        {getTimeFromAppointment(apt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="appointment-status"
                                                                style={{
                                                                    color: status.color,
                                                                    backgroundColor: status.bgColor
                                                                }}
                                                            >
                                                                <StatusIcon size={14} />
                                                                <span>{status.label}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Book More */}
                                    {onBook && (
                                        <div className="book-more-section">
                                            <button className="book-now-btn" onClick={() => { onClose(); onBook(); }}>
                                                Agendar Nova Consulta
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-tab">
                            <form onSubmit={handleSaveSettings}>
                                <div className="form-group">
                                    <label>
                                        <User size={16} />
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Seu nome"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Mail size={16} />
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="disabled"
                                    />
                                    <span className="field-hint">O e-mail não pode ser alterado</span>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <Phone size={16} />
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                {saveMessage && (
                                    <div className={`save-message ${saveMessage.type}`}>
                                        {saveMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        {saveMessage.text}
                                    </div>
                                )}

                                <button type="submit" className="save-btn" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader className="spinner" size={16} />
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar Alterações'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

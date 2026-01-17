import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, Clock, Plus, Search, MoreVertical, Ban, ClipboardList, TrendingUp, Star, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../services/appointmentApi';
import { serviceApi } from '../../services/serviceApi';
import { paymentService } from '../../services/paymentService';
import { getStoreAverageRating, getRecentReviews, type StoreReview } from '../../context/StoreReviewService';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import type { Appointment, Service } from '../../types';
import './StoreDashboard.css';

const StatCard = ({ icon: Icon, label, value, trend, color }: { icon: any, label: string, value: string | number, trend?: string, color: string }) => (
    <div className="stat-card">
        <div className="stat-card-icon" style={{ backgroundColor: `var(--${color}-50)`, color: `var(--${color}-600)` }}>
            <Icon size={24} strokeWidth={2} />
        </div>
        <div className="stat-card-content">
            <p className="stat-card-label">{label}</p>
            <h3 className="stat-card-value">{value}</h3>
            {trend && <span className="stat-card-trend text-success">{trend}</span>}
        </div>
    </div>
);

const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        confirmed: 'badge-success',
        pending: 'badge-warning',
        completed: 'badge-neutral',
        cancelled: 'badge-error',
    };
    return styles[status] || 'badge-neutral';
};

const formatStatus = (status: string) => {
    const labels: Record<string, string> = {
        confirmed: 'Confirmado',
        pending: 'Pendente',
        completed: 'Concluído',
        cancelled: 'Cancelado',
    };
    return labels[status] || status;
};

export const StoreDashboard = () => {
    const { store } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]); // Services for "Add Appointment" dropdown
    const [reviews, setReviews] = useState<StoreReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isProcessing, setIsProcessing] = useState(false);

    // Pro plan check - fetched from backend subscription
    const [isPro, setIsPro] = useState<boolean>(() => {
        // Initial check from store context
        return ['professional', 'business', 'pro'].includes(store?.plan || '');
    });

    // Load subscription status from backend on mount
    useEffect(() => {
        const loadSubscriptionStatus = async () => {
            try {
                const response = await paymentService.getSubscription();
                if (response.success && response.subscription) {
                    const plan = response.subscription.plan;
                    const isProPlan = ['professional', 'business', 'pro'].includes(plan);
                    setIsPro(isProPlan);
                }
            } catch (error) {
                console.error('Error loading subscription status:', error);
                // Fallback to store?.plan check
                setIsPro(['professional', 'business', 'pro'].includes(store?.plan || ''));
            }
        };

        loadSubscriptionStatus();
    }, [store?.id]);

    // Stats calculated from store data
    const [stats, setStats] = useState({
        appointmentsToday: 0,
        pendingRequests: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        revenueWeek: 0,
        revenueMonth: 0,
        averageRating: 5.0,
        ratingCount: 0,
        completionRate: 100,
    });

    const loadDashboardData = async () => {
        if (!store?.id) return;
        setIsLoading(true);

        try {
            // Parallel fetch of appointments and services
            const [aptResult, servResult] = await Promise.all([
                appointmentApi.list(store.id),
                serviceApi.list(store.id)
            ]);

            if (servResult.success) {
                setServices(servResult.services);
            }

            if (aptResult.success) {
                const storeAppointments = aptResult.appointments.map(a => ({
                    ...a,
                    id: a._id || a.id
                })) as Appointment[];

                setAppointments(storeAppointments);

                const today = new Date().toISOString().split('T')[0];

                // Calculate Stats
                const todayAppointments = storeAppointments.filter(a => a.date.startsWith(today));
                const pendingCount = storeAppointments.filter(a => a.status === 'pending').length;
                const completedCount = storeAppointments.filter(a => a.status === 'completed').length;
                const completedAppointments = storeAppointments.filter(a => a.status === 'completed');

                // Calculate revenue metrics
                const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

                // Week revenue (last 7 days)
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const revenueWeek = completedAppointments
                    .filter(a => new Date(a.date) >= weekAgo)
                    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);

                // Month revenue (current month)
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const revenueMonth = completedAppointments
                    .filter(a => {
                        const date = new Date(a.date);
                        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                    })
                    .reduce((sum, a) => sum + (a.servicePrice || 0), 0);

                // Estimate unique customers from appointments
                const uniqueCustomers = new Set(storeAppointments.map(a => a.customerName)).size;

                // Fetch reviews from API
                const { average, total } = await getStoreAverageRating(store.id);
                const recentReviews = await getRecentReviews(store.id);
                setReviews(recentReviews);

                setStats({
                    appointmentsToday: todayAppointments.length,
                    pendingRequests: pendingCount,
                    totalCustomers: uniqueCustomers,
                    totalRevenue: totalRevenue,
                    revenueWeek: revenueWeek,
                    revenueMonth: revenueMonth,
                    averageRating: average || 5.0,
                    ratingCount: total,
                    completionRate: storeAppointments.length > 0 ? Math.round((completedCount / storeAppointments.length) * 100) : 100,
                });
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load appointments and calculate stats
    useEffect(() => {
        loadDashboardData();
    }, [store?.id]);

    const filteredAppointments = filterStatus === 'all'
        ? appointments
        : appointments.filter(apt => apt.status === filterStatus);

    // Form State
    const [newCustomer, setNewCustomer] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newServiceId, setNewServiceId] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTime, setNewTime] = useState('');

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store?.id || !newServiceId) return;

        setIsProcessing(true);
        try {
            // Format Date ISO
            const [hours, minutes] = newTime.split(':').map(Number);
            const appointmentDate = new Date(newDate);
            appointmentDate.setHours(hours, minutes, 0, 0);

            const result = await appointmentApi.create({
                storeId: store.id,
                customerName: newCustomer,
                customerPhone: newPhone,
                serviceId: newServiceId,
                date: appointmentDate.toISOString(),
                // note: 'status' is pending by default in backend but dashboard usually creates confirmed for self-booking?
                // Backend CreateAppointmentData doesn't accept status. It defaults to pending.
                // We might want to auto-confirm if created by admin? 
                // For now, let it be pending.
            });

            if (result.success) {
                // If created by admin, maybe we want to auto-confirm immediately?
                // We can call updateStatus right after.
                if (result.appointment && result.appointment._id) {
                    await appointmentApi.updateStatus(result.appointment._id, 'confirmed');
                }

                await loadDashboardData();
                setIsAddModalOpen(false);
                resetForm();
            } else {
                showError('Erro ao criar agendamento');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            showError('Erro ao criar agendamento');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setNewCustomer('');
        setNewPhone('');
        setNewServiceId('');
        setNewDate(new Date().toISOString().split('T')[0]);
        setNewTime('');
    };

    const updateAppointmentStatus = async (id: string | number, status: Appointment['status']) => {
        // Optimistic update
        const originalAppointments = [...appointments];
        setAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status } : apt
        ));

        try {
            await appointmentApi.updateStatus(String(id), status);
            // Refresh stats (optional, but good for revenue calc)
            loadDashboardData();
        } catch (error) {
            console.error('Error updating status:', error);
            setAppointments(originalAppointments); // Revert
            showError('Erro ao atualizar status');
        }
    };

    if (isLoading && appointments.length === 0) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="store-dashboard">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <h1 className="dashboard-title">Bom dia, {store?.ownerName || 'João'} 👋</h1>
                    <p className="dashboard-subtitle">Veja o desempenho da sua loja hoje.</p>
                </div>
                <div className="dashboard-date">
                    <div className="pulse-dot" />
                    <span>
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon={Calendar}
                    label="Agendamentos Hoje"
                    value={stats.appointmentsToday}
                    trend="+12%"
                    color="primary"
                />
                <StatCard
                    icon={Clock}
                    label="Pendentes"
                    value={stats.pendingRequests}
                    color="warning"
                />
                <StatCard
                    icon={Users}
                    label="Total de Clientes"
                    value={stats.totalCustomers.toLocaleString('pt-BR')}
                    trend="+28 este mês"
                    color="primary"
                />
                <StatCard
                    icon={DollarSign}
                    label="Receita Total"
                    value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`}
                    color="success"
                />
                <StatCard
                    icon={Star}
                    label="Avaliação Média"
                    value={`${stats.averageRating} ★`}
                    trend={stats.ratingCount > 0 ? `${stats.ratingCount} avaliações` : 'Novas avaliações'}
                    color="info"
                />
            </div>

            <div className="dashboard-content">
                {/* Main Content - Appointments */}
                <div className="dashboard-main">
                    <div className="appointments-card">
                        <div className="appointments-header">
                            <div>
                                <h2 className="appointments-title">Agenda de Hoje</h2>
                                <p className="appointments-count">{filteredAppointments.length} agendamentos</p>
                            </div>
                            <div className="appointments-actions">
                                <select
                                    className="filter-select"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Todos</option>
                                    <option value="pending">Pendentes</option>
                                    <option value="confirmed">Confirmados</option>
                                    <option value="completed">Concluídos</option>
                                </select>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Plus size={16} />}
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    Novo
                                </Button>
                            </div>
                        </div>

                        <div className="appointments-list">
                            {filteredAppointments.length === 0 ? (
                                <div className="appointments-empty">
                                    <Calendar className="empty-icon" size={48} />
                                    <p>Nenhum agendamento encontrado.</p>
                                </div>
                            ) : (
                                filteredAppointments.map((apt) => (
                                    <div key={apt.id} className="appointment-item">
                                        <div className="appointment-info">
                                            <div className="appointment-avatar">
                                                {apt.avatar || apt.customerName[0]}
                                            </div>
                                            <div className="appointment-details">
                                                <h4 className="appointment-name">{apt.customerName}</h4>
                                                <p className="appointment-service">
                                                    <span>{apt.serviceName}</span>
                                                    <span className="dot" />
                                                    <span className="time">
                                                        {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="appointment-actions">
                                            <span className={`badge ${getStatusBadge(apt.status)}`}>
                                                {formatStatus(apt.status)}
                                            </span>
                                            <div className="appointment-dropdown">
                                                <button className="dropdown-trigger">
                                                    <MoreVertical size={18} />
                                                </button>
                                                <div className="dropdown-menu">
                                                    <button onClick={() => updateAppointmentStatus(apt.id, 'pending')}>
                                                        Pendente
                                                    </button>
                                                    <button onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}>
                                                        Confirmar
                                                    </button>
                                                    <button onClick={() => updateAppointmentStatus(apt.id, 'completed')}>
                                                        Concluir
                                                    </button>
                                                    <button onClick={() => updateAppointmentStatus(apt.id, 'cancelled')} className="danger">
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="dashboard-sidebar">
                    {/* Quick Actions */}
                    <div className="quick-actions-card">
                        <h3 className="sidebar-title">
                            <ClipboardList size={20} />
                            Ações Rápidas
                        </h3>
                        <div className="quick-actions-list">
                            <button className="quick-action-btn" onClick={() => setIsAddModalOpen(true)}>
                                <div className="quick-action-icon">
                                    <Plus size={18} />
                                </div>
                                <span>Novo Agendamento</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => navigate('/app/calendar')}>
                                <div className="quick-action-icon">
                                    <Ban size={18} />
                                </div>
                                <span>Bloquear Horário</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => navigate('/app/customers')}>
                                <div className="quick-action-icon">
                                    <Search size={18} />
                                </div>
                                <span>Buscar Cliente</span>
                            </button>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className="performance-card">
                        <h3 className="sidebar-title">Desempenho</h3>
                        {isPro ? (
                            <div className="performance-list">
                                <div className="performance-item">
                                    <div className="performance-header">
                                        <span className="performance-label">Meta Semanal</span>
                                        <span className="performance-value">75%</span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: '75%' }} />
                                    </div>
                                </div>
                                <div className="performance-item">
                                    <div className="performance-header">
                                        <span className="performance-label">Satisfação</span>
                                        <span className="performance-value">
                                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                            {stats.averageRating}
                                        </span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar success" style={{ width: '98%' }} />
                                    </div>
                                </div>
                                <div className="performance-item">
                                    <div className="performance-header">
                                        <span className="performance-label">Taxa de Conclusão</span>
                                        <span className="performance-value">{stats.completionRate}%</span>
                                    </div>
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: `${stats.completionRate}%` }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--surface-50)', borderRadius: '12px' }}>
                                <TrendingUp size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px', opacity: 0.5 }} />
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Relatórios Avançados</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Atualize para ver métricas de desempenho.</p>
                                <Button size="sm" variant="outline" onClick={() => navigate('/app/settings?tab=plans')}>Ver Planos</Button>
                            </div>
                        )}
                    </div>

                    {/* Revenue Summary */}
                    <div className="revenue-card">
                        <h3 className="sidebar-title">
                            <TrendingUp size={20} />
                            Resumo de Receita
                        </h3>
                        {isPro ? (
                            <div className="revenue-list">
                                <div className="revenue-item">
                                    <span className="revenue-label">Total</span>
                                    <span className="revenue-value">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="revenue-item">
                                    <span className="revenue-label">Esta Semana</span>
                                    <span className="revenue-value">R$ {stats.revenueWeek.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="revenue-item">
                                    <span className="revenue-label">Este Mês</span>
                                    <span className="revenue-value highlight">R$ {stats.revenueMonth.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--surface-50)', borderRadius: '12px' }}>
                                <DollarSign size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px', opacity: 0.5 }} />
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Controle Financeiro</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Atualize para ver seus ganhos.</p>
                                <Button size="sm" variant="outline" onClick={() => navigate('/app/settings?tab=plans')}>Ver Planos</Button>
                            </div>
                        )}
                    </div>

                    {/* Recent Reviews */}
                    <div className="recent-reviews-card" style={{ marginTop: '24px', background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--surface-200)' }}>
                        <h3 className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                            <Star size={20} style={{ color: '#fbbf24' }} />
                            Avaliações Recentes
                        </h3>
                        <div className="reviews-list">
                            {reviews.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nenhuma avaliação ainda.</p>
                            ) : (
                                reviews.map(review => (
                                    <div key={review.id} className="review-item" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--surface-100)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{review.customerName || 'Anônimo'}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    size={12}
                                                    fill={star <= review.rating ? "#fbbf24" : "none"}
                                                    color={star <= review.rating ? "#fbbf24" : "#d1d5db"}
                                                />
                                            ))}
                                        </div>
                                        {review.comment && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                                                "{review.comment}"
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Appointment Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); resetForm(); }}
                title="Novo Agendamento"
                description="Preencha os dados para criar um novo agendamento"
            >
                <form onSubmit={handleAddAppointment}>
                    <Input
                        label="Nome do Cliente"
                        placeholder="Ex: Carlos Santos"
                        value={newCustomer}
                        onChange={(e) => setNewCustomer(e.target.value)}
                        required
                    />
                    <Input
                        label="Telefone"
                        placeholder="(47) 99139-4589"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                    />

                    {/* Service Selection */}
                    <div className="input-group">
                        <label className="input-label">Serviço</label>
                        <select
                            className="input-field"
                            value={newServiceId}
                            onChange={(e) => setNewServiceId(e.target.value)}
                            required
                        >
                            <option value="">Selecione um serviço</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                            ))}
                        </select>
                        {services.length === 0 && (
                            <p className="text-sm text-yellow-600 mt-1">
                                Nenhum serviço cadastrado. Cadastre serviços primeiro.
                            </p>
                        )}
                    </div>

                    <div className="form-row">
                        <Input
                            label="Data"
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            required
                        />
                        <Input
                            label="Horário"
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isProcessing} disabled={services.length === 0}>
                            Agendar
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Block Time Modal */}
            <Modal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                title="Bloquear Horário"
                description="Selecione o período que deseja bloquear"
            >
                <form onSubmit={(e) => { e.preventDefault(); setIsBlockModalOpen(false); showSuccess('Horário bloqueado com sucesso!'); }}>
                    <Input
                        label="Motivo do Bloqueio"
                        placeholder="Ex: Almoço, Reunião, Folga..."
                    />
                    <div className="form-row">
                        <Input
                            label="Data"
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <Input
                            label="Hora Início"
                            type="time"
                            required
                        />
                        <Input
                            label="Hora Fim"
                            type="time"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => setIsBlockModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Bloquear
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

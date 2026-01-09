import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Users, AlertCircle, TrendingUp, DollarSign, Calendar, Star, ArrowUpRight, ArrowDownRight, Eye, MoreVertical } from 'lucide-react';
import { Button } from '../../components/Button';
import { getPlatformStats, getAllRegisteredStores, type PlatformStats, type RegisteredStore } from '../../context/AdminMasterService';
import './MasterDashboard.css';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color }: any) => (
    <div className="stat-card">
        <div className="stat-card-icon" style={{ backgroundColor: `var(--${color}-50)`, color: `var(--${color}-600)` }}>
            <Icon size={24} />
        </div>
        <div className="stat-card-content">
            <p className="stat-card-label">{label}</p>
            <h3 className="stat-card-value">{value}</h3>
            {trend && (
                <span className={`stat-card-trend ${trendUp ? 'up' : 'down'}`}>
                    {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </span>
            )}
        </div>
    </div>
);

export const MasterDashboard = () => {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [stores, setStores] = useState<RegisteredStore[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const platformStats = await getPlatformStats();
        const allStores = await getAllRegisteredStores();
        setStats(platformStats);
        setStores(allStores);
        setIsLoading(false);
    };

    // Calculate plan distribution
    const planDistribution = {
        free: stores.filter(s => s.plan === 'free').length,
        basic: stores.filter(s => s.plan === 'basic').length,
        pro: stores.filter(s => s.plan === 'pro').length,
    };
    const totalPlans = stores.length || 1;

    if (isLoading || !stats) {
        return (
            <div className="master-dashboard">
                <div className="loading-state">Carregando dados...</div>
            </div>
        );
    }

    return (
        <div className="master-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard Admin 👋</h1>
                    <p className="dashboard-subtitle">Visão geral da performance da plataforma</p>
                </div>
                <div className="dashboard-date">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon={Store}
                    label="Total de Lojas"
                    value={stats.totalStores}
                    trend={stats.totalStores > 0 ? "+1 nova" : undefined}
                    trendUp={true}
                    color="primary"
                />
                <StatCard
                    icon={Users}
                    label="Usuários Ativos"
                    value={stats.activeUsers.toLocaleString('pt-BR')}
                    trend={stats.activeUsers > 0 ? "ativos" : undefined}
                    trendUp={true}
                    color="primary"
                />
                <StatCard
                    icon={DollarSign}
                    label="Receita Total"
                    value={stats.totalRevenue}
                    trend={stats.revenueThisMonth > 0 ? `R$ ${stats.revenueThisMonth} este mês` : undefined}
                    trendUp={true}
                    color="success"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Reclamações Abertas"
                    value={stats.openComplaints}
                    color="error"
                />
            </div>

            {/* Secondary Stats */}
            <div className="secondary-stats">
                <div className="secondary-stat">
                    <Calendar size={20} />
                    <div>
                        <span className="secondary-stat-value">{stats.totalAppointments.toLocaleString('pt-BR')}</span>
                        <span className="secondary-stat-label">Agendamentos Totais</span>
                    </div>
                </div>
                <div className="secondary-stat">
                    <Star size={20} />
                    <div>
                        <span className="secondary-stat-value">{stats.averagePlatformRating || '-'}</span>
                        <span className="secondary-stat-label">Avaliação Média</span>
                    </div>
                </div>
                <div className="secondary-stat">
                    <TrendingUp size={20} />
                    <div>
                        <span className="secondary-stat-value">{stats.activeStores}</span>
                        <span className="secondary-stat-label">Lojas Ativas</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Recent Stores */}
                <div className="stores-card">
                    <div className="card-header">
                        <h2 className="card-title">Lojas Recentes</h2>
                        <Link to="/admin/master/stores">
                            <Button variant="outline" size="sm">Ver Todas</Button>
                        </Link>
                    </div>

                    {stores.length === 0 ? (
                        <div className="empty-state">
                            <Store size={48} />
                            <h3>Nenhuma loja cadastrada</h3>
                            <p>As lojas aparecerão aqui quando os proprietários se registrarem.</p>
                        </div>
                    ) : (
                        <div className="stores-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Loja</th>
                                        <th>Proprietário</th>
                                        <th>Plano</th>
                                        <th>Agendamentos</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stores.slice(0, 5).map((store) => (
                                        <tr key={store.id}>
                                            <td>
                                                <div className="store-cell">
                                                    <div className="store-avatar">{store.name.charAt(0)}</div>
                                                    <div className="store-info">
                                                        <span className="store-name">{store.name}</span>
                                                        <span className="store-slug">/{store.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="owner-cell">{store.ownerName}</td>
                                            <td>
                                                <span className={`plan-badge plan-${store.plan}`}>
                                                    {store.plan === 'free' ? 'Grátis' : store.plan === 'basic' ? 'Profissional' : 'Enterprise'}
                                                </span>
                                            </td>
                                            <td className="appointments-cell">{store.totalAppointments}</td>
                                            <td>
                                                <span className={`status-badge status-${store.status}`}>
                                                    {store.status === 'active' ? 'Ativo' : store.status === 'pending' ? 'Pendente' : 'Suspenso'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <Link to={`/store/${store.slug}`} target="_blank">
                                                        <button className="action-btn" title="Ver Loja">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>
                                                    <button className="action-btn" title="Mais Opções">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Stats Sidebar */}
                <div className="quick-stats">
                    <div className="quick-stat-card">
                        <h3 className="quick-stat-title">Distribuição de Planos</h3>
                        <div className="plan-distribution">
                            <div className="plan-row">
                                <span className="plan-name">Grátis</span>
                                <div className="plan-bar">
                                    <div className="plan-fill free" style={{ width: `${(planDistribution.free / totalPlans) * 100}%` }} />
                                </div>
                                <span className="plan-count">{planDistribution.free}</span>
                            </div>
                            <div className="plan-row">
                                <span className="plan-name">Profissional</span>
                                <div className="plan-bar">
                                    <div className="plan-fill basic" style={{ width: `${(planDistribution.basic / totalPlans) * 100}%` }} />
                                </div>
                                <span className="plan-count">{planDistribution.basic}</span>
                            </div>
                            <div className="plan-row">
                                <span className="plan-name">Enterprise</span>
                                <div className="plan-bar">
                                    <div className="plan-fill pro" style={{ width: `${(planDistribution.pro / totalPlans) * 100}%` }} />
                                </div>
                                <span className="plan-count">{planDistribution.pro}</span>
                            </div>
                        </div>
                    </div>

                    <div className="quick-stat-card">
                        <h3 className="quick-stat-title">Tickets de Suporte</h3>
                        <div className="support-stats">
                            <div className="support-stat">
                                <span className="support-value">{stats.openSupportTickets}</span>
                                <span className="support-label">Abertos</span>
                            </div>
                            <div className="support-stat">
                                <span className="support-value">0</span>
                                <span className="support-label">Resolvidos Hoje</span>
                            </div>
                            <div className="support-stat">
                                <span className="support-value">-</span>
                                <span className="support-label">Tempo Médio</span>
                            </div>
                        </div>
                    </div>

                    <div className="quick-stat-card highlight">
                        <h3 className="quick-stat-title">Atividade Hoje</h3>
                        <div className="today-activity">
                            <div className="activity-item">
                                <Calendar size={18} />
                                <span>{stats.appointmentsToday} agendamentos</span>
                            </div>
                            <div className="activity-item">
                                <Store size={18} />
                                <span>{stats.activeStoresThisMonth} novas lojas este mês</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

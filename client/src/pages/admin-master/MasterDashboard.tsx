import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Users, AlertCircle, TrendingUp, DollarSign, Calendar, Star, ArrowUpRight, ArrowDownRight, Eye, MoreVertical, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { getPlatformStats, getAllRegisteredStores, updateStoreStatus, deleteStore, type PlatformStats, type RegisteredStore } from '../../context/AdminMasterService';
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
    const [user, setUser] = useState<any>(null); // To store current user for actions
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [platformStats, allStores] = await Promise.all([
                getPlatformStats(),
                getAllRegisteredStores()
            ]);
            setStats(platformStats);
            setStores(allStores);
        } catch (error) {
            console.error('Error loading master data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (store: RegisteredStore) => {
        const newStatus = store.status === 'suspended' ? 'active' : 'suspended';
        const confirmMsg = newStatus === 'suspended'
            ? `Tem certeza que deseja desativar o site "${store.name}"? O proprietário não poderá vender e clientes não poderão agendar.`
            : `Deseja reativar o site "${store.name}"?`;

        if (window.confirm(confirmMsg)) {
            const success = await updateStoreStatus(store.id, newStatus);
            if (success) {
                loadData();
                setActiveMenu(null);
            } else {
                alert('Erro ao atualizar status da loja');
            }
        }
    };

    const handleDeleteStore = async (store: RegisteredStore) => {
        if (window.confirm(`⚠️ AÇÃO IRREVERSÍVEL: Tem certeza que deseja EXCLUIR permanentemente a loja "${store.name}" e todos os seus dados?`)) {
            const success = await deleteStore(store.id);
            if (success) {
                loadData();
                setActiveMenu(null);
            } else {
                alert('Erro ao excluir loja');
            }
        }
    };

    // Use real plan distribution from backend stats
    const planDistribution = stats?.planDistribution || {
        free: 0,
        basic: 0,
        pro: 0,
    };

    // Merge basic and pro into Professional count as Enterprise is removed
    const professionalCount = (planDistribution.basic || 0) + (planDistribution.pro || 0);
    const totalPlans = (planDistribution.free + professionalCount) || 1;

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
                                                    {store.plan === 'free' ? 'Grátis' : 'Profissional'}
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
                                                    <Link to={`/${store.slug}`} target="_blank">
                                                        <button className="action-btn" title="Ver Loja">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>
                                                    <div className="relative" style={{ zIndex: activeMenu === store.id ? 100 : 1 }}>
                                                        <button
                                                            className={`action-btn ${activeMenu === store.id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                console.log('Action menu clicked for store:', store.id);
                                                                setActiveMenu(activeMenu === store.id ? null : store.id);
                                                            }}
                                                            title="Mais Opções"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {activeMenu === store.id && (
                                                            <div className="dropdown-menu">
                                                                <button onClick={() => handleToggleStatus(store)} className="dropdown-item">
                                                                    {store.status === 'suspended' ? (
                                                                        <><CheckCircle size={14} /> Ativar Site</>
                                                                    ) : (
                                                                        <><Ban size={14} /> Desativar Site</>
                                                                    )}
                                                                </button>
                                                                <button onClick={() => handleDeleteStore(store)} className="dropdown-item delete">
                                                                    <Trash2 size={14} /> Excluir Loja
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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
                                    <div className="plan-fill pro" style={{ width: `${(professionalCount / totalPlans) * 100}%` }} />
                                </div>
                                <span className="plan-count">{professionalCount}</span>
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

import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign,
    Users, Store, Calendar, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getAllRegisteredStores, getPlatformStats, type RegisteredStore, type PlatformStats } from '../../context/AdminMasterService';
// import { getStoreAppointments } from '../../context/StoreDataService';
import './MasterAnalyticsPage.css';

interface MonthlyData {
    month: string;
    appointments: number;
    revenue: number;
    newStores: number;
}

export const MasterAnalyticsPage = () => {
    const [stores, setStores] = useState<RegisteredStore[]>([]);
    const [stats, setStats] = useState<PlatformStats>({
        totalStores: 0, activeStores: 0, activeStoresThisMonth: 0, pendingStores: 0,
        totalUsers: 0, activeUsers: 0,
        totalAppointments: 0, appointmentsToday: 0,
        totalRevenue: 'R$ 0,00', revenueThisMonth: 0,
        openComplaints: 0, pendingSupport: 0, openSupportTickets: 0,
        averagePlatformRating: 0
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [topStores, setTopStores] = useState<RegisteredStore[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allStores, platformStats] = await Promise.all([
                getAllRegisteredStores(),
                getPlatformStats()
            ]);

            setStores(allStores);
            setStats(platformStats);

            // Calculate top stores by appointments (this is fine as we have totals in Store object)
            const sortedStores = [...allStores].sort((a, b) => b.totalAppointments - a.totalAppointments);
            setTopStores(sortedStores.slice(0, 5));

            // Use monthly data from backend if available
            if (platformStats.monthlyData) {
                setMonthlyData(platformStats.monthlyData);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    };

    const maxAppointments = Math.max(...monthlyData.map(m => m.appointments), 1);
    const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

    // Use real plan distribution from backend stats
    const planDistribution = stats?.planDistribution || {
        free: 0,
        basic: 0,
        pro: 0,
    };

    const professionalCount = (planDistribution.basic || 0) + (planDistribution.pro || 0);
    const totalPlans = (planDistribution.free + professionalCount) || 1;

    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {};
    stores.forEach(s => {
        const cat = s.category || 'Outros';
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    return (
        <div className="master-analytics-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Relatórios e Analytics</h1>
                    <p className="page-subtitle">Métricas e insights da plataforma</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                        <Store size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Total de Lojas</span>
                        <span className="summary-value">{stats.totalStores}</span>
                        <span className="summary-trend up">
                            <ArrowUpRight size={14} />
                            {stats.activeStoresThisMonth} este mês
                        </span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon" style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
                        <Users size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Usuários Ativos</span>
                        <span className="summary-value">{stats.activeUsers}</span>
                        <span className="summary-trend up">
                            <ArrowUpRight size={14} />
                            clientes ativos
                        </span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Receita Total</span>
                        <span className="summary-value">{stats.totalRevenue}</span>
                        <span className="summary-trend up">
                            <ArrowUpRight size={14} />
                            R$ {stats.revenueThisMonth} este mês
                        </span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Agendamentos</span>
                        <span className="summary-value">{stats.totalAppointments}</span>
                        <span className="summary-trend">
                            {stats.appointmentsToday} hoje
                        </span>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Appointments Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <Calendar size={18} />
                        Agendamentos por Mês
                    </h3>
                    <div className="bar-chart">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="bar-item">
                                <div className="bar-container">
                                    <div
                                        className="bar"
                                        style={{ height: `${(data.appointments / maxAppointments) * 100}%` }}
                                    >
                                        <span className="bar-value">{data.appointments}</span>
                                    </div>
                                </div>
                                <span className="bar-label">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <DollarSign size={18} />
                        Receita por Mês
                    </h3>
                    <div className="bar-chart">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="bar-item">
                                <div className="bar-container">
                                    <div
                                        className="bar revenue"
                                        style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                    >
                                        <span className="bar-value">R${data.revenue}</span>
                                    </div>
                                </div>
                                <span className="bar-label">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Stores */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <TrendingUp size={18} />
                        Top Lojas por Agendamentos
                    </h3>
                    {topStores.length === 0 ? (
                        <div className="empty-chart">
                            <p>Nenhuma loja cadastrada ainda</p>
                        </div>
                    ) : (
                        <div className="top-list">
                            {topStores.map((store, index) => (
                                <div key={store.id} className="top-item">
                                    <span className="top-rank">#{index + 1}</span>
                                    <div className="top-info">
                                        <span className="top-name">{store.name}</span>
                                        <span className="top-category">{store.category}</span>
                                    </div>
                                    <div className="top-stats">
                                        <span className="top-appointments">{store.totalAppointments} agend.</span>
                                        <div className="top-rating">
                                            <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                                            {store.rating || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Plan Distribution */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <BarChart3 size={18} />
                        Distribuição de Planos
                    </h3>
                    <div className="distribution-chart">
                        <div className="distribution-item">
                            <div className="distribution-header">
                                <span className="distribution-label">Grátis</span>
                                <span className="distribution-count">{planDistribution.free}</span>
                            </div>
                            <div className="distribution-bar">
                                <div
                                    className="distribution-fill free"
                                    style={{ width: `${(planDistribution.free / totalPlans) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="distribution-item">
                            <div className="distribution-header">
                                <span className="distribution-label">Profissional</span>
                                <span className="distribution-count">{professionalCount}</span>
                            </div>
                            <div className="distribution-bar">
                                <div
                                    className="distribution-fill pro"
                                    style={{ width: `${(professionalCount / totalPlans) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="chart-card full-width">
                    <h3 className="chart-title">
                        <Store size={18} />
                        Lojas por Categoria
                    </h3>
                    {Object.keys(categoryDistribution).length === 0 ? (
                        <div className="empty-chart">
                            <p>Nenhuma loja cadastrada ainda</p>
                        </div>
                    ) : (
                        <div className="category-grid">
                            {Object.entries(categoryDistribution).map(([category, count]) => (
                                <div key={category} className="category-item">
                                    <span className="category-name">{category}</span>
                                    <span className="category-count">{count} lojas</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

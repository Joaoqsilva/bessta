import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    Store,
    MessageSquare,
    Bell,
    LogOut,
    ChevronRight,
    HelpCircle,
    AlertTriangle,
    BarChart3,
    Zap,
    ExternalLink,
    Crown,
    Key
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { notificationService, type Notification } from '../services/notificationService';
import './Sidebar.css';

interface SidebarProps {
    type: 'master' | 'store';
}

const storeNavItems = [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/app/settings?tab=plans', icon: Crown, label: 'Planos' },
    { to: '/app/calendar', icon: Calendar, label: 'Calendário' },
    { to: '/app/appointments', icon: Users, label: 'Agendamentos' },
    { to: '/app/services', icon: Zap, label: 'Serviços' },
    { to: '/app/customers', icon: Users, label: 'Clientes' },
    { to: '/app/editor', icon: Store, label: 'Aparência' },
    { to: '/app/settings', icon: Settings, label: 'Configurações' },
];

const masterNavItems = [
    { to: '/admin/master', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/master/stores', icon: Store, label: 'Lojas' },
    { to: '/admin/master/users', icon: Users, label: 'Usuários' },
    { to: '/admin/master/licenses', icon: Key, label: 'Licenças' },
    { to: '/admin/master/complaints', icon: AlertTriangle, label: 'Reclamações' },
    { to: '/admin/master/support', icon: MessageSquare, label: 'Suporte' },
    { to: '/admin/master/analytics', icon: BarChart3, label: 'Relatórios' },
    { to: '/admin/master/settings', icon: Settings, label: 'Configurações' },
];

// Mock notifications removed

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, store, logout } = useAuth();
    const navItems = type === 'master' ? masterNavItems : storeNavItems;
    const title = type === 'master' ? 'Admin Master' : (store?.name || 'Minha Loja');

    // State for modals
    const [showNotifications, setShowNotifications] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>(
        (store?.plan as any) === 'pro' || (user as any)?.plan === 'pro' ? 'pro' : 'free'
    );
    const [isCancelling, setIsCancelling] = useState(false);

    // Initial load of notifications
    useEffect(() => {
        loadNotifications();

        // Polling for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    // Load current plan on mount
    useEffect(() => {
        if (type === 'store') {
            const loadPlan = async () => {
                try {
                    const response = await paymentService.getSubscription();
                    console.log('DEBUG [Sidebar]: Subscription status:', response);
                    if (response.success && response.subscription) {
                        const plan = response.subscription.plan;
                        setCurrentPlan(plan === 'professional' || plan === 'business' || plan === 'pro' ? 'pro' : 'free');
                        setIsCancelling(response.subscription.status === 'cancelled');
                    }
                } catch (error) {
                    console.error('Error loading plan:', error);
                }
            };

            // Load on mount
            loadPlan();

            // Reload when tab becomes visible
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    loadPlan();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [type]);

    // Get store slug from auth context
    const storeSlug = store?.slug || 'urban-styles';

    // unreadCount is now in state

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleVisitStore = () => {
        window.open(`/${storeSlug}`, '_blank');
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d`;
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <Calendar size={20} />
                        </div>
                        <div className="sidebar-logo-text">
                            <span className="sidebar-brand">BookMe</span>
                            <span className="sidebar-type">{title}</span>
                            {type === 'store' && (
                                <span className={`sidebar-plan-badge ${currentPlan === 'free' ? 'free' : 'pro'}`}>
                                    {currentPlan !== 'free' ? (
                                        <>
                                            <Crown size={12} />
                                            <span>
                                                {isCancelling ? 'Encerra em breve' : 'Profissional'}
                                            </span>
                                        </>
                                    ) : (
                                        <span>Starter</span>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-nav-section">
                        <span className="sidebar-nav-title">Menu Principal</span>
                        <ul className="sidebar-nav-list">
                            {navItems.map((item) => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.exact}
                                        className={({ isActive }) =>
                                            `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`
                                        }
                                    >
                                        <item.icon size={20} className="sidebar-nav-icon" />
                                        <span className="sidebar-nav-label">{item.label}</span>
                                        <ChevronRight size={16} className="sidebar-nav-chevron" />
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    {/* Visit Store Button - Only for store owners */}
                    {type === 'store' && (
                        <button className="sidebar-visit-store-btn" onClick={handleVisitStore}>
                            <ExternalLink size={18} />
                            <span>Visitar Minha Loja</span>
                        </button>
                    )}

                    {/* Upgrade Card - Only show if not Pro */}
                    {currentPlan !== 'pro' && (
                        <div className="sidebar-upgrade-card" onClick={() => navigate('/app/settings?tab=plans')}>
                            <div className="sidebar-upgrade-icon">
                                <Zap size={20} />
                            </div>
                            <div className="sidebar-upgrade-text">
                                <span className="sidebar-upgrade-title">Upgrade para Pro</span>
                                <span className="sidebar-upgrade-desc">Desbloqueie recursos avançados</span>
                            </div>
                        </div>
                    )}

                    <div className="sidebar-actions">
                        <button
                            className="sidebar-action-btn"
                            onClick={() => setShowNotifications(true)}
                            title="Notificações"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="sidebar-notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        <button
                            className="sidebar-action-btn"
                            onClick={() => setShowHelp(true)}
                            title="Ajuda"
                        >
                            <HelpCircle size={18} />
                        </button>
                        <button
                            className="sidebar-action-btn sidebar-logout-btn"
                            onClick={() => setShowLogoutConfirm(true)}
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>

                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {user?.ownerName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user?.ownerName || 'Usuário'}</span>
                            <span className="sidebar-user-email">{user?.email || 'email@exemplo.com'}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Notifications Modal */}
            <Modal
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                title="Notificações"
                description={`Você tem ${unreadCount} notificações não lidas`}
            >
                <div className="notifications-modal">
                    {unreadCount > 0 && (
                        <button className="mark-all-read-btn" onClick={markAllAsRead}>
                            Marcar todas como lidas
                        </button>
                    )}
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <Bell size={32} />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                >
                                    <div className="notification-content">
                                        <span className="notification-title">{notification.title}</span>
                                        <span className="notification-message">{notification.message}</span>
                                    </div>
                                    <span className="notification-time">{formatDate(notification.createdAt)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>

            {/* Help Modal */}
            <Modal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                title="Central de Ajuda"
                description="Como podemos te ajudar?"
            >
                <div className="help-modal">
                    <div className="help-section">
                        <h4>📚 Documentação</h4>
                        <p>Acesse nossa documentação completa para aprender a usar todas as funcionalidades.</p>
                        <Button variant="outline" size="sm">Ver Documentação</Button>
                    </div>
                    <div className="help-section">
                        <h4>💬 Suporte ao Vivo</h4>
                        <p>Precisa de ajuda urgente? Fale com nossa equipe de suporte.</p>
                        <Button variant="outline" size="sm">Iniciar Chat</Button>
                    </div>
                    <div className="help-section">
                        <h4>📧 Email</h4>
                        <p>Envie um email para <strong>suporte@bookme.com.br</strong></p>
                    </div>
                    <div className="help-section">
                        <h4>📱 WhatsApp</h4>
                        <p>Atendimento via WhatsApp: <strong>(11) 99999-9999</strong></p>
                    </div>
                </div>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                title="Sair da conta"
                description="Tem certeza que deseja sair?"
            >
                <div className="logout-modal">
                    <p>Você será desconectado da sua conta e redirecionado para a página de login.</p>
                    <div className="logout-actions">
                        <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleLogout}>
                            Sair
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

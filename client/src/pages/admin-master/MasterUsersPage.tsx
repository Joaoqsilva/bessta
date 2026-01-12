import { useState, useEffect } from 'react';
import {
    Users, Search, Mail, Phone, Store, Calendar,
    MoreVertical, Shield, ShieldOff, Trash2, Eye, Edit, Key, Crown
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { getAllUsers, updatePlatformUser, resetUserPassword, updateUserPlan } from '../../context/AdminMasterService';
import './MasterUsersPage.css';

interface PlatformUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'owner' | 'customer';
    storeId?: string;
    storeName?: string;
    createdAt: string;
    status: 'active' | 'blocked';
    plan: 'free' | 'basic' | 'pro' | 'start' | 'professional' | 'business';
}

export const MasterUsersPage = () => {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<PlatformUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'owner' | 'customer'>('all');

    // Actions State
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

    // Modals State
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);

    // Form State
    const [editForm, setEditForm] = useState({ name: '', storeName: '' });
    const [passwordForm, setPasswordForm] = useState({ newPassword: '' });
    const [planForm, setPlanForm] = useState({ plan: 'start' as string });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, typeFilter]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dropdown')) {
                setShowActionsMenu(null);
            }
        };

        if (showActionsMenu) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showActionsMenu]);

    const loadUsers = async () => {
        try {
            const apiUsers = await getAllUsers();

            // Map API users to PlatformUser interface
            const mappedUsers: PlatformUser[] = apiUsers.map(u => ({
                id: u.id || u._id,
                name: u.ownerName || u.name,
                email: u.email,
                phone: u.phone,
                type: u.role === 'store_owner' ? 'owner' : 'customer',
                storeId: u.storeId,
                storeName: u.storeName,
                createdAt: u.createdAt,
                status: u.isActive === false ? 'blocked' : 'active', // Assuming isActive field exists or default active
                plan: u.plan || u.subscriptionPlan || 'start',
            }));

            setUsers(mappedUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const filterUsers = () => {
        let result = [...users];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.storeName?.toLowerCase().includes(query)
            );
        }

        if (typeFilter !== 'all') {
            result = result.filter(u => u.type === typeFilter);
        }

        setFilteredUsers(result);
    };

    // --- Actions ---

    const handleEditClick = (user: PlatformUser) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            storeName: user.storeName || ''
        });
        setShowEditModal(true);
        setShowActionsMenu(null);
    };

    const handlePasswordClick = (user: PlatformUser) => {
        setSelectedUser(user);
        setPasswordForm({ newPassword: '' });
        setShowPasswordModal(true);
        setShowActionsMenu(null);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsLoading(true);
        const success = await updatePlatformUser(selectedUser.id, editForm);
        setIsLoading(false);

        if (success) {
            alert('Usuário atualizado com sucesso!');
            setShowEditModal(false);
            loadUsers(); // Reload to see changes
        } else {
            alert('Erro ao atualizar usuário.');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsLoading(true);
        const success = await resetUserPassword(selectedUser.id, passwordForm.newPassword);
        setIsLoading(false);

        if (success) {
            alert('Senha redefinida com sucesso!');
            setShowPasswordModal(false);
        } else {
            alert('Erro ao redefinir senha.');
        }
    };

    const handlePlanClick = (user: PlatformUser) => {
        setSelectedUser(user);
        setPlanForm({ plan: user.plan || 'start' });
        setShowPlanModal(true);
        setShowActionsMenu(null);
    };

    const handleUpdatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsLoading(true);
        const success = await updateUserPlan(selectedUser.id, planForm.plan);
        setIsLoading(false);

        if (success) {
            alert('Plano atualizado com sucesso!');
            setShowPlanModal(false);
            loadUsers(); // Reload to see changes
        } else {
            alert('Erro ao atualizar plano.');
        }
    };

    const handleBlockUser = () => {
        // Toggle block logic (would require API endpoint for blocking)
        setShowBlockModal(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatPlanName = (plan: string) => {
        const planNames: Record<string, string> = {
            'free': 'Gratuito',
            'basic': 'Básico',
            'pro': 'Pro',
            'start': 'Start',
            'professional': 'Profissional',
            'business': 'Business'
        };
        return planNames[plan] || plan;
    };

    const getPlanColor = (plan: string) => {
        const planColors: Record<string, string> = {
            'free': '#6b7280',
            'basic': '#3b82f6',
            'pro': '#8b5cf6',
            'start': '#10b981',
            'professional': '#f59e0b',
            'business': '#ef4444'
        };
        return planColors[plan] || '#6b7280';
    };

    const ownerCount = users.filter(u => u.type === 'owner').length;
    const customerCount = users.filter(u => u.type === 'customer').length;

    return (
        <div className="master-users-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gerenciar Usuários</h1>
                    <p className="page-subtitle">Visualize e gerencie todos os usuários da plataforma</p>
                </div>
                <div className="header-stats">
                    <div className="header-stat">
                        <Store size={18} />
                        <span>{ownerCount} Proprietários</span>
                    </div>
                    {/* <div className="header-stat">
                        <Users size={18} />
                        <span>{customerCount} Clientes</span>
                    </div> */}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou loja..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* <div className="filter-buttons">
                    <button
                        className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('all')}
                    >
                        Todos
                    </button>
                    <button
                        className={`filter-btn ${typeFilter === 'owner' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('owner')}
                    >
                        Proprietários
                    </button>
                     <button
                        className={`filter-btn ${typeFilter === 'customer' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('customer')}
                    >
                        Clientes
                    </button>
                </div> */}
            </div>

            {/* Users Table */}
            <div className="users-container">
                {filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <Users size={64} />
                        <h3>Nenhum usuário encontrado</h3>
                        <p>
                            {users.length === 0
                                ? 'Os usuários aparecerão aqui quando se registrarem.'
                                : 'Tente ajustar os filtros de busca.'
                            }
                        </p>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Contato</th>
                                <th>Tipo</th>
                                <th>Loja Associada</th>
                                <th>Cadastro</th>
                                <th>Plano</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className={`user-avatar ${user.type}`}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{user.name}</span>
                                                <span className="user-id" title={user.id}>ID: ...{user.id.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <span className="contact-email">
                                                <Mail size={14} />
                                                {user.email}
                                            </span>
                                            <span className="contact-phone">
                                                <Phone size={14} />
                                                {user.phone || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`type-badge type-${user.type}`}>
                                            {user.type === 'owner' ? 'Proprietário' : 'Cliente'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.storeName ? (
                                            <span className="store-name">{user.storeName}</span>
                                        ) : (
                                            <span className="no-store">-</span>
                                        )}
                                    </td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <span
                                            className="plan-badge"
                                            style={{
                                                backgroundColor: getPlanColor(user.plan) + '20',
                                                color: getPlanColor(user.plan),
                                                border: `1px solid ${getPlanColor(user.plan)}40`
                                            }}
                                        >
                                            <Crown size={12} />
                                            {formatPlanName(user.plan)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${user.status}`}>
                                            {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <div className="dropdown" style={{ zIndex: showActionsMenu === user.id ? 100 : 1, position: 'relative' }}>
                                                <button
                                                    type="button"
                                                    className="action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setShowActionsMenu(showActionsMenu === user.id ? null : user.id);
                                                    }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {showActionsMenu === user.id && (
                                                    <div className="dropdown-menu">
                                                        <button type="button" onClick={() => handleEditClick(user)}>
                                                            <Edit size={14} />
                                                            Editar Dados
                                                        </button>
                                                        <button type="button" onClick={() => handlePlanClick(user)}>
                                                            <Crown size={14} />
                                                            Atualizar Plano
                                                        </button>
                                                        <button type="button" onClick={() => handlePasswordClick(user)}>
                                                            <Key size={14} />
                                                            Redefinir Senha
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowBlockModal(true);
                                                                setShowActionsMenu(null);
                                                            }}
                                                        >
                                                            {user.status === 'active' ? (
                                                                <><ShieldOff size={14} /> Bloquear</>
                                                            ) : (
                                                                <><Shield size={14} /> Desbloquear</>
                                                            )}
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
                )}
            </div>

            {/* Block Confirmation Modal */}
            <Modal
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                title={selectedUser?.status === 'active' ? 'Bloquear Usuário' : 'Desbloquear Usuário'}
            >
                <div className="block-modal-content">
                    <p>
                        {selectedUser?.status === 'active'
                            ? `Tem certeza que deseja bloquear ${selectedUser?.name}?`
                            : `Tem certeza que deseja desbloquear ${selectedUser?.name}?`
                        }
                    </p>
                    <div className="modal-actions">
                        <Button variant="outline" onClick={() => setShowBlockModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant={selectedUser?.status === 'active' ? 'secondary' : 'primary'}
                            onClick={handleBlockUser}
                        >
                            {selectedUser?.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Editar Usuário"
            >
                <form onSubmit={handleUpdateUser}>
                    <Input
                        label="Nome do Responsável"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />
                    {selectedUser?.type === 'owner' && (
                        <Input
                            label="Nome da Loja"
                            value={editForm.storeName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, storeName: e.target.value }))}
                            required
                        />
                    )}
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading}>
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Redefinir Senha"
            >
                <form onSubmit={handleResetPassword}>
                    <p className="mb-4 text-sm text-gray-600">
                        Digite a nova senha para o usuário <strong>{selectedUser?.name}</strong>.
                    </p>
                    <Input
                        label="Nova Senha"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                        required
                        minLength={6}
                    />
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading}>
                            Redefinir Senha
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Update Plan Modal */}
            <Modal
                isOpen={showPlanModal}
                onClose={() => setShowPlanModal(false)}
                title="Atualizar Plano"
            >
                <form onSubmit={handleUpdatePlan}>
                    <p className="mb-4 text-sm text-gray-600">
                        Selecione o novo plano para o usuário <strong>{selectedUser?.name}</strong>.
                    </p>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Plano
                        </label>
                        <select
                            value={planForm.plan}
                            onChange={(e) => setPlanForm({ plan: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                backgroundColor: '#fff',
                                cursor: 'pointer'
                            }}
                            required
                        >
                            <option value="start">Start (Gratuito)</option>
                            <option value="free">Free (Gratuito)</option>
                            <option value="basic">Básico</option>
                            <option value="professional">Profissional</option>
                            <option value="pro">Pro</option>
                            <option value="business">Business</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => setShowPlanModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading}>
                            Atualizar Plano
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

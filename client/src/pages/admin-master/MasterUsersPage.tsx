import { useState, useEffect } from 'react';
import {
    Users, Search, Mail, Phone, Store, Calendar,
    MoreVertical, Shield, ShieldOff, Trash2, Eye
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { getAllRegisteredStores, type RegisteredStore } from '../../context/AdminMasterService';
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
}

export const MasterUsersPage = () => {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<PlatformUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'owner' | 'customer'>('all');
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, typeFilter]);

    const loadUsers = async () => {
        const allUsers: PlatformUser[] = [];
        const stores = await getAllRegisteredStores();

        // Get store owners from registered stores
        stores.forEach(store => {
            allUsers.push({
                id: `owner_${store.id}`,
                name: store.ownerName,
                email: store.ownerEmail,
                phone: store.phone,
                type: 'owner',
                storeId: store.id,
                storeName: store.name,
                createdAt: store.createdAt,
                status: 'active',
            });
        });

        // Get customers from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('customer_') && !key.includes('_')) {
                try {
                    const customer = JSON.parse(localStorage.getItem(key) || '{}');
                    if (customer.id && customer.name) {
                        const storeSlug = key.replace('customer_', '');
                        const store = stores.find(s => s.slug === storeSlug);
                        allUsers.push({
                            id: `customer_${customer.id}`,
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone,
                            type: 'customer',
                            storeId: store?.id,
                            storeName: store?.name,
                            createdAt: new Date().toISOString(),
                            status: 'active',
                        });
                    }
                } catch (e) {
                    console.error('Error parsing customer:', e);
                }
            }
        }

        setUsers(allUsers);
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

    const handleBlockUser = () => {
        if (selectedUser) {
            // Toggle block status
            setUsers(prev => prev.map(u =>
                u.id === selectedUser.id
                    ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' }
                    : u
            ));
            setShowBlockModal(false);
            setSelectedUser(null);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
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
                    <div className="header-stat">
                        <Users size={18} />
                        <span>{customerCount} Clientes</span>
                    </div>
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
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('all')}
                    >
                        Todos ({users.length})
                    </button>
                    <button
                        className={`filter-btn ${typeFilter === 'owner' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('owner')}
                    >
                        Proprietários ({ownerCount})
                    </button>
                    <button
                        className={`filter-btn ${typeFilter === 'customer' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('customer')}
                    >
                        Clientes ({customerCount})
                    </button>
                </div>
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
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{user.name}</span>
                                                <span className="user-id">ID: {user.id.slice(0, 12)}...</span>
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
                                        <span className={`status-badge status-${user.status}`}>
                                            {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <div className="dropdown" style={{ zIndex: showActionsMenu === user.id ? 100 : 1, position: 'relative' }}>
                                                <button
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
                                                        <button>
                                                            <Eye size={14} />
                                                            Ver Detalhes
                                                        </button>
                                                        <button
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
                    <p className="warning">
                        {selectedUser?.status === 'active'
                            ? 'O usuário não poderá acessar a plataforma enquanto estiver bloqueado.'
                            : 'O usuário voltará a ter acesso normal à plataforma.'
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
        </div>
    );
};

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Store, Search, Filter, Eye, Trash2, Ban, CheckCircle,
    MoreVertical, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { getAllRegisteredStores, updateStoreStatus, deleteStore, type RegisteredStore } from '../../context/AdminMasterService';
import './MasterStoresPage.css';

export const MasterStoresPage = () => {
    const [stores, setStores] = useState<RegisteredStore[]>([]);
    const [filteredStores, setFilteredStores] = useState<RegisteredStore[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
    const [selectedStore, setSelectedStore] = useState<RegisteredStore | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

    useEffect(() => {
        loadStores();
    }, []);

    useEffect(() => {
        filterStores();
    }, [stores, searchQuery, statusFilter]);

    const loadStores = () => {
        const allStores = getAllRegisteredStores();
        setStores(allStores);
    };

    const filterStores = () => {
        let result = [...stores];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.ownerName.toLowerCase().includes(query) ||
                s.slug.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(s => s.status === statusFilter);
        }

        setFilteredStores(result);
    };

    const handleStatusChange = (storeId: string, newStatus: 'active' | 'pending' | 'suspended') => {
        updateStoreStatus(storeId, newStatus);
        loadStores();
        setShowActionsMenu(null);
    };

    const handleDelete = () => {
        if (selectedStore) {
            deleteStore(selectedStore.id);
            loadStores();
            setShowDeleteModal(false);
            setSelectedStore(null);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'pending': return 'Pendente';
            case 'suspended': return 'Suspenso';
            default: return status;
        }
    };

    const getPlanLabel = (plan: string) => {
        switch (plan) {
            case 'free': return 'Grátis';
            case 'basic': return 'Profissional';
            case 'pro': return 'Enterprise';
            default: return plan;
        }
    };

    return (
        <div className="master-stores-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gerenciar Lojas</h1>
                    <p className="page-subtitle">Visualize e gerencie todas as lojas da plataforma</p>
                </div>
                <div className="header-actions">
                    <Button variant="primary" leftIcon={<Plus size={18} />}>
                        Adicionar Loja
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, proprietário ou slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        Todas ({stores.length})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        Ativas ({stores.filter(s => s.status === 'active').length})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pendentes ({stores.filter(s => s.status === 'pending').length})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'suspended' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('suspended')}
                    >
                        Suspensas ({stores.filter(s => s.status === 'suspended').length})
                    </button>
                </div>
            </div>

            {/* Stores Table */}
            <div className="stores-container">
                {filteredStores.length === 0 ? (
                    <div className="empty-state">
                        <Store size={64} />
                        <h3>Nenhuma loja encontrada</h3>
                        <p>
                            {stores.length === 0
                                ? 'As lojas aparecerão aqui quando os proprietários se registrarem.'
                                : 'Tente ajustar os filtros de busca.'
                            }
                        </p>
                    </div>
                ) : (
                    <table className="stores-table">
                        <thead>
                            <tr>
                                <th>Loja</th>
                                <th>Proprietário</th>
                                <th>Categoria</th>
                                <th>Plano</th>
                                <th>Agendamentos</th>
                                <th>Clientes</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStores.map((store) => (
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
                                    <td>
                                        <div className="owner-info">
                                            <span className="owner-name">{store.ownerName}</span>
                                            <span className="owner-email">{store.ownerEmail}</span>
                                        </div>
                                    </td>
                                    <td>{store.category}</td>
                                    <td>
                                        <span className={`plan-badge plan-${store.plan}`}>
                                            {getPlanLabel(store.plan)}
                                        </span>
                                    </td>
                                    <td className="number-cell">{store.totalAppointments}</td>
                                    <td className="number-cell">{store.totalCustomers}</td>
                                    <td>
                                        <span className={`status-badge status-${store.status}`}>
                                            {getStatusLabel(store.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <Link to={`/store/${store.slug}`} target="_blank">
                                                <button className="action-btn" title="Ver Loja">
                                                    <Eye size={16} />
                                                </button>
                                            </Link>
                                            <div className="dropdown">
                                                <button
                                                    className="action-btn"
                                                    onClick={() => setShowActionsMenu(showActionsMenu === store.id ? null : store.id)}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {showActionsMenu === store.id && (
                                                    <div className="dropdown-menu">
                                                        {store.status !== 'active' && (
                                                            <button onClick={() => handleStatusChange(store.id, 'active')}>
                                                                <CheckCircle size={14} />
                                                                Ativar
                                                            </button>
                                                        )}
                                                        {store.status !== 'suspended' && (
                                                            <button onClick={() => handleStatusChange(store.id, 'suspended')}>
                                                                <Ban size={14} />
                                                                Suspender
                                                            </button>
                                                        )}
                                                        <button
                                                            className="danger"
                                                            onClick={() => {
                                                                setSelectedStore(store);
                                                                setShowDeleteModal(true);
                                                                setShowActionsMenu(null);
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                            Excluir
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Excluir Loja"
            >
                <div className="delete-modal-content">
                    <p>Tem certeza que deseja excluir a loja <strong>{selectedStore?.name}</strong>?</p>
                    <p className="warning">Esta ação não pode ser desfeita. Todos os dados da loja serão removidos permanentemente.</p>
                    <div className="modal-actions">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="secondary" onClick={handleDelete} className="danger-btn">
                            Excluir Loja
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

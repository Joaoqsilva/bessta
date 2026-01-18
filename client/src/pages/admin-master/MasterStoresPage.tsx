import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Store, Search, Filter, Eye, Trash2, Ban, CheckCircle,
    MoreVertical, ChevronLeft, ChevronRight, Plus, UserX, Power, PowerOff
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { getAllRegisteredStores, updateStoreStatus, deleteStore, type RegisteredStore } from '../../context/AdminMasterService';
import './MasterStoresPage.css';

export const MasterStoresPage = () => {
    const [stores, setStores] = useState<RegisteredStore[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalStores: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const [selectedStore, setSelectedStore] = useState<RegisteredStore | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUserToo, setDeleteUserToo] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== debouncedSearch) {
                setDebouncedSearch(searchQuery);
                setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search change
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    // Reset page when status filter changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [statusFilter]);

    // Load stores when dependencies change
    useEffect(() => {
        loadStores();
    }, [pagination.page, debouncedSearch, statusFilter]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showActionsMenu) {
                const target = event.target as HTMLElement;
                if (!target.closest('.dropdown')) {
                    setShowActionsMenu(null);
                }
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showActionsMenu]);

    const loadStores = async () => {
        setIsLoading(true);
        try {
            const result = await getAllRegisteredStores(
                pagination.page,
                pagination.limit,
                debouncedSearch,
                statusFilter
            );
            setStores(result.stores);
            if (result.pagination) {
                setPagination(prev => ({ ...prev, ...result.pagination }));
            }
        } catch (error) {
            console.error('Error loading stores:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleStatusChange = async (storeId: string, newStatus: 'active' | 'pending' | 'suspended') => {
        await updateStoreStatus(storeId, newStatus);
        loadStores();
        setShowActionsMenu(null);
    };

    const handleDelete = async () => {
        if (selectedStore) {
            await deleteStore(selectedStore.id, deleteUserToo);
            loadStores();
            setShowDeleteModal(false);
            setSelectedStore(null);
            setDeleteUserToo(false);
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
            case 'pro': return 'Profissional';
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
                {/* <div className="header-actions">
                    <Button variant="primary" leftIcon={<Plus size={18} />}>
                        Adicionar Loja
                    </Button>
                </div> */}
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
                        Todas
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        Ativas
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pendentes
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'suspended' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('suspended')}
                    >
                        Suspensas
                    </button>
                </div>
            </div>

            {/* Stores Table */}
            <div className="stores-container">
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : stores.length === 0 ? (
                    <div className="empty-state">
                        <Store size={64} />
                        <h3>Nenhuma loja encontrada</h3>
                        <p>Tente ajustar os filtros de busca.</p>
                    </div>
                ) : (
                    <>
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
                                {stores.map((store) => (
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
                                                <Link to={`/${store.slug}`} target="_blank">
                                                    <button className="action-btn" title="Ver Loja">
                                                        <Eye size={16} />
                                                    </button>
                                                </Link>
                                                <div className="dropdown">
                                                    <button
                                                        type="button"
                                                        className="action-btn"
                                                        onClick={() => setShowActionsMenu(showActionsMenu === store.id ? null : store.id)}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {showActionsMenu === store.id && (
                                                        <div className="dropdown-menu">
                                                            {store.status !== 'active' && (
                                                                <button onClick={() => handleStatusChange(store.id, 'active')}>
                                                                    <Power size={14} />
                                                                    Ativar
                                                                </button>
                                                            )}
                                                            {store.status === 'active' && (
                                                                <button onClick={() => handleStatusChange(store.id, 'suspended')}>
                                                                    <PowerOff size={14} />
                                                                    Desativar
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
                                                                Excluir Loja
                                                            </button>
                                                            <button
                                                                className="danger"
                                                                onClick={() => {
                                                                    setSelectedStore(store);
                                                                    setDeleteUserToo(true);
                                                                    setShowDeleteModal(true);
                                                                    setShowActionsMenu(null);
                                                                }}
                                                            >
                                                                <UserX size={14} />
                                                                Excluir Loja + Conta
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

                        {/* Pagination Controls */}
                        <div className="pagination-controls flex justify-between items-center p-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                Mostrando page {pagination.page} de {pagination.totalPages} ({pagination.totalStores} lojas)
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    leftIcon={<ChevronLeft size={16} />}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    rightIcon={<ChevronRight size={16} />}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setDeleteUserToo(false); }}
                title="Excluir Loja"
            >
                <div className="delete-modal-content">
                    <p>Tem certeza que deseja excluir a loja <strong>{selectedStore?.name}</strong>?</p>

                    <div style={{ margin: '1rem 0', padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={deleteUserToo}
                                onChange={(e) => setDeleteUserToo(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: 500 }}>Também excluir a conta do proprietário ({selectedStore?.ownerEmail})</span>
                        </label>
                    </div>

                    <p className="warning">
                        {deleteUserToo
                            ? '⚠️ A loja E a conta do proprietário serão removidos permanentemente. Esta ação não pode ser desfeita.'
                            : 'A loja será removida, mas a conta do proprietário será mantida. Esta ação não pode ser desfeita.'
                        }
                    </p>
                    <div className="modal-actions">
                        <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteUserToo(false); }}>
                            Cancelar
                        </Button>
                        <Button variant="secondary" onClick={handleDelete} className="danger-btn">
                            {deleteUserToo ? 'Excluir Loja e Conta' : 'Excluir Apenas Loja'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

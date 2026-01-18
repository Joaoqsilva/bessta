import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Store, Search, Eye, Trash2, Ban,
    ChevronLeft, ChevronRight, Power, PowerOff,
    Calendar, Users, Star, MapPin, Phone, Mail,
    ExternalLink, Layout, Clock, XCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
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

    // Modal states
    const [selectedStore, setSelectedStore] = useState<RegisteredStore | null>(null);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUserToo, setDeleteUserToo] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== debouncedSearch) {
                setDebouncedSearch(searchQuery);
                setPagination(prev => ({ ...prev, page: 1 }));
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

    const handleStoreClick = (store: RegisteredStore) => {
        setSelectedStore(store);
        setShowStoreModal(true);
    };

    const handleStatusChange = async (newStatus: 'active' | 'pending' | 'suspended') => {
        if (!selectedStore) return;
        setActionLoading(true);
        try {
            await updateStoreStatus(selectedStore.id, newStatus);
            // Update local state
            setSelectedStore(prev => prev ? { ...prev, status: newStatus } : null);
            loadStores();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedStore) return;
        setActionLoading(true);
        try {
            await deleteStore(selectedStore.id, deleteUserToo);
            loadStores();
            setShowDeleteModal(false);
            setShowStoreModal(false);
            setSelectedStore(null);
            setDeleteUserToo(false);
        } catch (error) {
            console.error('Error deleting store:', error);
        } finally {
            setActionLoading(false);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="master-stores-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gerenciar Lojas</h1>
                    <p className="page-subtitle">Clique em uma loja para ver detalhes e gerenciar</p>
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

            {/* Stores Grid */}
            <div className="stores-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando lojas...</p>
                    </div>
                ) : stores.length === 0 ? (
                    <div className="empty-state">
                        <Store size={64} />
                        <h3>Nenhuma loja encontrada</h3>
                        <p>Tente ajustar os filtros de busca.</p>
                    </div>
                ) : (
                    <>
                        <div className="stores-grid">
                            {stores.map((store) => (
                                <div
                                    key={store.id}
                                    className="store-card"
                                    onClick={() => handleStoreClick(store)}
                                >
                                    <div className="store-card-header">
                                        <div className="store-avatar">{store.name.charAt(0)}</div>
                                        <div className="store-main-info">
                                            <h3 className="store-name">{store.name}</h3>
                                            <span className="store-slug">/{store.slug}</span>
                                        </div>
                                        <span className={`status-badge status-${store.status}`}>
                                            {getStatusLabel(store.status)}
                                        </span>
                                    </div>

                                    <div className="store-card-body">
                                        <div className="store-owner">
                                            <Mail size={14} />
                                            <span>{store.ownerEmail}</span>
                                        </div>
                                        <div className="store-stats-row">
                                            <div className="store-stat">
                                                <Calendar size={14} />
                                                <span>{store.totalAppointments} agend.</span>
                                            </div>
                                            <div className="store-stat">
                                                <Users size={14} />
                                                <span>{store.totalCustomers} clientes</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="store-card-footer">
                                        <span className={`plan-badge plan-${store.plan}`}>
                                            {getPlanLabel(store.plan)}
                                        </span>
                                        <span className="category-tag">{store.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="pagination-controls">
                            <div className="pagination-info">
                                Página {pagination.page} de {pagination.totalPages} ({pagination.totalStores} lojas)
                            </div>
                            <div className="pagination-buttons">
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

            {/* Store Details Modal */}
            <Modal
                isOpen={showStoreModal}
                onClose={() => { setShowStoreModal(false); setSelectedStore(null); }}
                title="Detalhes da Loja"
            >
                {selectedStore && (
                    <div className="store-details-modal">
                        {/* Header */}
                        <div className="modal-store-header">
                            <div className="modal-store-avatar">{selectedStore.name.charAt(0)}</div>
                            <div className="modal-store-info">
                                <h2>{selectedStore.name}</h2>
                                <span className="modal-store-slug">/{selectedStore.slug}</span>
                            </div>
                            <span className={`status-badge status-${selectedStore.status}`}>
                                {getStatusLabel(selectedStore.status)}
                            </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="modal-stats-grid">
                            <div className="modal-stat-card">
                                <Calendar size={20} />
                                <div className="stat-content">
                                    <span className="stat-value">{selectedStore.totalAppointments}</span>
                                    <span className="stat-label">Agendamentos</span>
                                </div>
                            </div>
                            <div className="modal-stat-card">
                                <Users size={20} />
                                <div className="stat-content">
                                    <span className="stat-value">{selectedStore.totalCustomers}</span>
                                    <span className="stat-label">Clientes</span>
                                </div>
                            </div>
                            <div className="modal-stat-card">
                                <Star size={20} />
                                <div className="stat-content">
                                    <span className="stat-value">{selectedStore.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="stat-label">Avaliação ({selectedStore.totalReviews || 0})</span>
                                </div>
                            </div>
                            <div className="modal-stat-card">
                                <Layout size={20} />
                                <div className="stat-content">
                                    <span className="stat-value">{getPlanLabel(selectedStore.plan)}</span>
                                    <span className="stat-label">Plano</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Sections */}
                        <div className="modal-info-sections">
                            <div className="info-section">
                                <h4>Informações do Proprietário</h4>
                                <div className="info-row">
                                    <span className="info-label">Nome:</span>
                                    <span className="info-value">{selectedStore.ownerName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{selectedStore.ownerEmail}</span>
                                </div>
                                {selectedStore.phone && (
                                    <div className="info-row">
                                        <span className="info-label">Telefone:</span>
                                        <span className="info-value">{selectedStore.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="info-section">
                                <h4>Informações da Loja</h4>
                                <div className="info-row">
                                    <span className="info-label">Categoria:</span>
                                    <span className="info-value">{selectedStore.category}</span>
                                </div>
                                {selectedStore.address && (
                                    <div className="info-row">
                                        <span className="info-label">Endereço:</span>
                                        <span className="info-value">{selectedStore.address}</span>
                                    </div>
                                )}
                                <div className="info-row">
                                    <span className="info-label">Criada em:</span>
                                    <span className="info-value">{formatDate(selectedStore.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="modal-actions-section">
                            <h4>Ações Rápidas</h4>
                            <div className="quick-actions-grid">
                                <Link to={`/${selectedStore.slug}`} target="_blank" className="quick-action-btn view">
                                    <ExternalLink size={18} />
                                    Ver Página
                                </Link>

                                {selectedStore.status !== 'active' && (
                                    <button
                                        className="quick-action-btn activate"
                                        onClick={() => handleStatusChange('active')}
                                        disabled={actionLoading}
                                    >
                                        <Power size={18} />
                                        Ativar
                                    </button>
                                )}

                                {selectedStore.status === 'active' && (
                                    <button
                                        className="quick-action-btn deactivate"
                                        onClick={() => handleStatusChange('suspended')}
                                        disabled={actionLoading}
                                    >
                                        <PowerOff size={18} />
                                        Desativar
                                    </button>
                                )}

                                {selectedStore.status !== 'suspended' && (
                                    <button
                                        className="quick-action-btn suspend"
                                        onClick={() => handleStatusChange('suspended')}
                                        disabled={actionLoading}
                                    >
                                        <Ban size={18} />
                                        Suspender
                                    </button>
                                )}

                                <button
                                    className="quick-action-btn delete"
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={actionLoading}
                                >
                                    <Trash2 size={18} />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setDeleteUserToo(false); }}
                title="Excluir Loja"
            >
                <div className="delete-modal-content">
                    <p>Tem certeza que deseja excluir a loja <strong>{selectedStore?.name}</strong>?</p>

                    <div className="delete-checkbox-wrapper">
                        <label className="delete-checkbox-label">
                            <input
                                type="checkbox"
                                checked={deleteUserToo}
                                onChange={(e) => setDeleteUserToo(e.target.checked)}
                            />
                            <span>Também excluir a conta do proprietário ({selectedStore?.ownerEmail})</span>
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
                        <Button
                            variant="secondary"
                            onClick={handleDelete}
                            className="danger-btn"
                            isLoading={actionLoading}
                        >
                            {deleteUserToo ? 'Excluir Loja e Conta' : 'Excluir Apenas Loja'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

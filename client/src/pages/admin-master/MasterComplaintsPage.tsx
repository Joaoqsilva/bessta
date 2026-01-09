import { useState, useEffect } from 'react';
import {
    AlertTriangle, Search, CheckCircle, XCircle, Clock,
    User, Store, ThumbsUp, ThumbsDown, MessageCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { complaintsApi } from '../../services/platformApi';
import type { Complaint as IComplaint } from '../../services/platformApi';
import './MasterComplaintsPage.css';

interface Complaint {
    id: string;
    _id?: string;
    title: string;
    description: string;
    type: 'service' | 'payment' | 'conduct' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high';
    complainantId: string;
    complainantName: string;
    complainantEmail: string;
    targetStoreId: string;
    targetStoreName: string;
    resolution?: string;
    createdAt: string;
    resolvedAt?: string;
}

export const MasterComplaintsPage = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolution, setResolution] = useState('');
    const [resolveAction, setResolveAction] = useState<'resolved' | 'dismissed'>('resolved');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, []);

    useEffect(() => {
        filterComplaints();
    }, [complaints, searchQuery, statusFilter]);

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            const response = await complaintsApi.getAll();
            // Normalize: use _id as id if id doesn't exist
            const normalized = response.complaints.map(c => ({
                ...c,
                id: c._id || (c as any).id,
            }));
            setComplaints(normalized as Complaint[]);
        } catch (error) {
            console.error('Error loading complaints:', error);
            setComplaints([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterComplaints = () => {
        let result = [...complaints];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(query) ||
                c.complainantName.toLowerCase().includes(query) ||
                (c.targetStoreName && c.targetStoreName.toLowerCase().includes(query))
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(c => c.status === statusFilter);
        }

        setFilteredComplaints(result);
    };

    const handleStatusChange = async (complaintId: string, newStatus: Complaint['status']) => {
        try {
            await complaintsApi.update(complaintId, { status: newStatus as any });
            setComplaints(prev => prev.map(c =>
                c.id === complaintId ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            console.error('Error updating complaint status:', error);
            alert('Erro ao atualizar status');
        }
    };

    const handleResolve = async () => {
        if (!selectedComplaint) return;

        try {
            const id = selectedComplaint._id || selectedComplaint.id;
            await complaintsApi.update(id, {
                status: resolveAction as any,
                resolution
            });
            setComplaints(prev => prev.map(c =>
                c.id === selectedComplaint.id
                    ? {
                        ...c,
                        status: resolveAction,
                        resolution,
                        resolvedAt: new Date().toISOString()
                    }
                    : c
            ));
            setShowResolveModal(false);
            setSelectedComplaint(null);
            setResolution('');
        } catch (error) {
            console.error('Error resolving complaint:', error);
            alert('Erro ao resolver reclamação');
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'service': return 'Serviço';
            case 'payment': return 'Pagamento';
            case 'conduct': return 'Conduta';
            case 'other': return 'Outro';
            default: return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Pendente';
            case 'in_progress': return 'Em Investigação';
            case 'resolved': return 'Resolvido';
            case 'dismissed': return 'Arquivado';
            default: return status;
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low': return 'Baixa';
            case 'medium': return 'Média';
            case 'high': return 'Alta';
            default: return priority;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const pendingCount = complaints.filter(c => c.status === 'open').length;
    const investigatingCount = complaints.filter(c => c.status === 'in_progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'dismissed').length;

    return (
        <div className="master-complaints-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reclamações</h1>
                    <p className="page-subtitle">Gerencie reclamações de usuários sobre lojas</p>
                </div>
                <div className="header-stats">
                    <div className="header-stat pending">
                        <AlertTriangle size={18} />
                        <span>{pendingCount} Pendentes</span>
                    </div>
                    <div className="header-stat investigating">
                        <Clock size={18} />
                        <span>{investigatingCount} Em Investigação</span>
                    </div>
                    <div className="header-stat resolved">
                        <CheckCircle size={18} />
                        <span>{resolvedCount} Resolvidas</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por título, reclamante ou loja..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        Todas ({complaints.length})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'open' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('open')}
                    >
                        Pendentes ({pendingCount})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('in_progress')}
                    >
                        Em Investigação ({investigatingCount})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'resolved' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('resolved')}
                    >
                        Resolvidas ({resolvedCount})
                    </button>
                </div>
            </div>

            {/* Complaints List */}
            <div className="complaints-container">
                {filteredComplaints.length === 0 ? (
                    <div className="empty-state">
                        <AlertTriangle size={64} />
                        <h3>Nenhuma reclamação encontrada</h3>
                        <p>
                            {complaints.length === 0
                                ? 'As reclamações aparecerão aqui quando forem registradas.'
                                : 'Tente ajustar os filtros de busca.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="complaints-list">
                        {filteredComplaints.map((complaint) => (
                            <div key={complaint.id} className="complaint-card">
                                <div className="complaint-header">
                                    <div className="complaint-meta">
                                        <span className={`priority-badge priority-${complaint.priority}`}>
                                            {getPriorityLabel(complaint.priority)}
                                        </span>
                                        <span className="type-badge">
                                            {getTypeLabel(complaint.type)}
                                        </span>
                                        <span className={`status-badge status-${complaint.status}`}>
                                            {getStatusLabel(complaint.status)}
                                        </span>
                                    </div>
                                    <span className="complaint-date">{formatDate(complaint.createdAt)}</span>
                                </div>

                                <h3 className="complaint-title">{complaint.title}</h3>
                                <p className="complaint-description">{complaint.description}</p>

                                <div className="complaint-parties">
                                    <div className="party complainant">
                                        <User size={16} />
                                        <div>
                                            <span className="party-label">Reclamante</span>
                                            <span className="party-name">{complaint.complainantName}</span>
                                        </div>
                                    </div>
                                    <div className="party-arrow">→</div>
                                    <div className="party target">
                                        <Store size={16} />
                                        <div>
                                            <span className="party-label">Loja</span>
                                            <span className="party-name">{complaint.targetStoreName}</span>
                                        </div>
                                    </div>
                                </div>

                                {complaint.resolution && (
                                    <div className="complaint-resolution">
                                        <MessageCircle size={16} />
                                        <div>
                                            <span className="resolution-label">Resolução</span>
                                            <p>{complaint.resolution}</p>
                                        </div>
                                    </div>
                                )}

                                {complaint.status !== 'resolved' && complaint.status !== 'dismissed' && (
                                    <div className="complaint-actions">
                                        {complaint.status === 'open' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                                            >
                                                Iniciar Investigação
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            leftIcon={<ThumbsUp size={14} />}
                                            onClick={() => {
                                                setSelectedComplaint(complaint);
                                                setResolveAction('resolved');
                                                setShowResolveModal(true);
                                            }}
                                        >
                                            Resolver
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            leftIcon={<ThumbsDown size={14} />}
                                            onClick={() => {
                                                setSelectedComplaint(complaint);
                                                setResolveAction('dismissed');
                                                setShowResolveModal(true);
                                            }}
                                        >
                                            Arquivar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resolve Modal */}
            <Modal
                isOpen={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                title={resolveAction === 'resolved' ? 'Resolver Reclamação' : 'Arquivar Reclamação'}
            >
                <div className="resolve-modal-content">
                    <p>
                        {resolveAction === 'resolved'
                            ? 'Descreva como a reclamação foi resolvida:'
                            : 'Descreva o motivo do arquivamento:'
                        }
                    </p>
                    <textarea
                        placeholder="Digite a resolução..."
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                    />
                    <div className="modal-actions">
                        <Button variant="outline" onClick={() => setShowResolveModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant={resolveAction === 'resolved' ? 'primary' : 'secondary'}
                            onClick={handleResolve}
                            disabled={!resolution.trim()}
                        >
                            {resolveAction === 'resolved' ? 'Resolver' : 'Arquivar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

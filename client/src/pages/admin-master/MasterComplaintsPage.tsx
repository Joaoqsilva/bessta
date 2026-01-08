import { useState, useEffect } from 'react';
import {
    AlertTriangle, Search, CheckCircle, XCircle, Clock,
    User, Store, ThumbsUp, ThumbsDown, MessageCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { getAllRegisteredStores } from '../../context/AdminMasterService';
import './MasterComplaintsPage.css';

interface Complaint {
    id: string;
    title: string;
    description: string;
    type: 'service' | 'payment' | 'conduct' | 'other';
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
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
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolution, setResolution] = useState('');
    const [resolveAction, setResolveAction] = useState<'resolved' | 'dismissed'>('resolved');

    useEffect(() => {
        loadComplaints();
    }, []);

    useEffect(() => {
        filterComplaints();
    }, [complaints, searchQuery, statusFilter]);

    const loadComplaints = () => {
        const stored = localStorage.getItem('platform_complaints');
        if (stored) {
            setComplaints(JSON.parse(stored));
        } else {
            // Generate demo complaints if stores exist
            const stores = getAllRegisteredStores();
            const demoComplaints: Complaint[] = [];

            if (stores.length > 0) {
                demoComplaints.push({
                    id: 'complaint_1',
                    title: 'Atraso no atendimento',
                    description: 'O profissional atrasou mais de 30 minutos para iniciar o serviço agendado.',
                    type: 'service',
                    status: 'pending',
                    priority: 'medium',
                    complainantId: 'user_1',
                    complainantName: 'Cliente Exemplo',
                    complainantEmail: 'cliente@email.com',
                    targetStoreId: stores[0].id,
                    targetStoreName: stores[0].name,
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                });
            }

            setComplaints(demoComplaints);
            localStorage.setItem('platform_complaints', JSON.stringify(demoComplaints));
        }
    };

    const filterComplaints = () => {
        let result = [...complaints];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(query) ||
                c.complainantName.toLowerCase().includes(query) ||
                c.targetStoreName.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(c => c.status === statusFilter);
        }

        setFilteredComplaints(result);
    };

    const handleStatusChange = (complaintId: string, newStatus: Complaint['status']) => {
        const updated = complaints.map(c =>
            c.id === complaintId ? { ...c, status: newStatus } : c
        );
        setComplaints(updated);
        localStorage.setItem('platform_complaints', JSON.stringify(updated));
    };

    const handleResolve = () => {
        if (!selectedComplaint) return;

        const updated = complaints.map(c =>
            c.id === selectedComplaint.id
                ? {
                    ...c,
                    status: resolveAction,
                    resolution,
                    resolvedAt: new Date().toISOString()
                }
                : c
        );
        setComplaints(updated);
        localStorage.setItem('platform_complaints', JSON.stringify(updated));
        setShowResolveModal(false);
        setSelectedComplaint(null);
        setResolution('');
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
            case 'pending': return 'Pendente';
            case 'investigating': return 'Em Investigação';
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

    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const investigatingCount = complaints.filter(c => c.status === 'investigating').length;
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
                        className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pendentes ({pendingCount})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'investigating' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('investigating')}
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
                                        {complaint.status === 'pending' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusChange(complaint.id, 'investigating')}
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

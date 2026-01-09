import { useState, useEffect } from 'react';
import {
    MessageSquare, Search, Clock, CheckCircle, AlertCircle,
    Send, User, Store, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { supportApi } from '../../services/platformApi';
import type { SupportTicket as ISupportTicket } from '../../services/platformApi';
import './MasterSupportPage.css';

interface SupportTicket {
    id: string;
    _id?: string;
    subject: string;
    message: string;
    category: 'technical' | 'billing' | 'general' | 'complaint' | 'account' | 'feature' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
    userId: string;
    userName: string;
    userEmail: string;
    storeId?: string;
    storeName?: string;
    createdAt: string;
    updatedAt: string;
    responses: TicketResponse[];
}

interface TicketResponse {
    id?: string;
    message: string;
    isAdmin?: boolean;
    isStaff?: boolean;
    responderId?: string;
    responderName?: string;
    authorName?: string;
    createdAt: string;
}

export const MasterSupportPage = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newResponse, setNewResponse] = useState('');
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        filterTickets();
    }, [tickets, searchQuery, statusFilter]);

    const loadTickets = async () => {
        try {
            setIsLoading(true);
            const response = await supportApi.getAll();
            // Normalize: use _id as id if id doesn't exist
            const normalized = response.tickets.map(t => ({
                ...t,
                id: t._id || (t as any).id,
                // Normalize responses
                responses: (t.responses || []).map((r: any) => ({
                    ...r,
                    id: r._id || r.id || `resp_${Date.now()}`,
                    isAdmin: r.isStaff || r.isAdmin,
                    authorName: r.responderName || r.authorName || 'Suporte',
                }))
            }));
            setTickets(normalized as SupportTicket[]);
        } catch (error) {
            console.error('Error loading support tickets:', error);
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterTickets = () => {
        let result = [...tickets];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.subject.toLowerCase().includes(query) ||
                t.userName.toLowerCase().includes(query) ||
                t.storeName?.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }

        setFilteredTickets(result);
    };

    const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
        try {
            const id = tickets.find(t => t.id === ticketId)?._id || ticketId;
            await supportApi.update(id, { status: newStatus as any });
            setTickets(prev => prev.map(t =>
                t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
            ));
        } catch (error) {
            console.error('Error updating ticket status:', error);
            alert('Erro ao atualizar status');
        }
    };

    const handleSendResponse = async (ticketId: string) => {
        if (!newResponse.trim()) return;

        try {
            const ticket = tickets.find(t => t.id === ticketId);
            if (!ticket) return;

            const id = ticket._id || ticketId;
            const updated = await supportApi.update(id, { response: newResponse });

            // Update local state with the response
            const localResponse: TicketResponse = {
                id: `resp_${Date.now()}`,
                message: newResponse,
                isAdmin: true,
                authorName: 'Admin',
                createdAt: new Date().toISOString(),
            };

            setTickets(prev => prev.map(t =>
                t.id === ticketId
                    ? {
                        ...t,
                        responses: [...t.responses, localResponse],
                        status: t.status === 'open' ? 'in_progress' as any : t.status,
                        updatedAt: new Date().toISOString()
                    }
                    : t
            ));
            setNewResponse('');
        } catch (error) {
            console.error('Error sending response:', error);
            alert('Erro ao enviar resposta');
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Aberto';
            case 'in_progress': return 'Em Andamento';
            case 'resolved': return 'Resolvido';
            case 'closed': return 'Fechado';
            default: return status;
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'technical': return 'Técnico';
            case 'billing': return 'Financeiro';
            case 'general': return 'Geral';
            case 'complaint': return 'Reclamação';
            default: return category;
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

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d atrás`;
        if (diffHours > 0) return `${diffHours}h atrás`;
        if (diffMins > 0) return `${diffMins}min atrás`;
        return 'Agora';
    };

    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

    return (
        <div className="master-support-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Suporte</h1>
                    <p className="page-subtitle">Gerencie tickets de suporte dos usuários</p>
                </div>
                <div className="header-stats">
                    <div className="header-stat open">
                        <AlertCircle size={18} />
                        <span>{openCount} Abertos</span>
                    </div>
                    <div className="header-stat progress">
                        <Clock size={18} />
                        <span>{inProgressCount} Em Andamento</span>
                    </div>
                    <div className="header-stat resolved">
                        <CheckCircle size={18} />
                        <span>{resolvedCount} Resolvidos</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por assunto, usuário ou loja..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        Todos ({tickets.length})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'open' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('open')}
                    >
                        Abertos ({openCount})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('in_progress')}
                    >
                        Em Andamento ({inProgressCount})
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'resolved' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('resolved')}
                    >
                        Resolvidos ({resolvedCount})
                    </button>
                </div>
            </div>

            {/* Tickets List */}
            <div className="tickets-container">
                {filteredTickets.length === 0 ? (
                    <div className="empty-state">
                        <MessageSquare size={64} />
                        <h3>Nenhum ticket encontrado</h3>
                        <p>
                            {tickets.length === 0
                                ? 'Os tickets de suporte aparecerão aqui.'
                                : 'Tente ajustar os filtros de busca.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="tickets-list">
                        {filteredTickets.map((ticket) => (
                            <div key={ticket.id} className={`ticket-card ${expandedTicket === ticket.id ? 'expanded' : ''}`}>
                                <div
                                    className="ticket-header"
                                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                                >
                                    <div className="ticket-info">
                                        <div className="ticket-meta">
                                            <span className={`priority-badge priority-${ticket.priority}`}>
                                                {getPriorityLabel(ticket.priority)}
                                            </span>
                                            <span className="category-badge">
                                                {getCategoryLabel(ticket.category)}
                                            </span>
                                        </div>
                                        <h3 className="ticket-subject">{ticket.subject}</h3>
                                        <div className="ticket-user">
                                            <User size={14} />
                                            <span>{ticket.userName}</span>
                                            {ticket.storeName && (
                                                <>
                                                    <Store size={14} />
                                                    <span>{ticket.storeName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ticket-status">
                                        <span className={`status-badge status-${ticket.status}`}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                        <span className="ticket-time">{formatTimeAgo(ticket.createdAt)}</span>
                                        {expandedTicket === ticket.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {expandedTicket === ticket.id && (
                                    <div className="ticket-body">
                                        <div className="ticket-message">
                                            <p>{ticket.message}</p>
                                        </div>

                                        {ticket.responses.length > 0 && (
                                            <div className="ticket-responses">
                                                {ticket.responses.map((response) => (
                                                    <div key={response.id} className={`response ${response.isAdmin ? 'admin' : 'user'}`}>
                                                        <div className="response-header">
                                                            <span className="response-author">{response.authorName}</span>
                                                            <span className="response-time">{formatTimeAgo(response.createdAt)}</span>
                                                        </div>
                                                        <p>{response.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="ticket-reply">
                                            <textarea
                                                placeholder="Digite sua resposta..."
                                                value={newResponse}
                                                onChange={(e) => setNewResponse(e.target.value)}
                                            />
                                            <div className="reply-actions">
                                                <div className="status-actions">
                                                    <select
                                                        value={ticket.status}
                                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as SupportTicket['status'])}
                                                    >
                                                        <option value="open">Aberto</option>
                                                        <option value="in_progress">Em Andamento</option>
                                                        <option value="resolved">Resolvido</option>
                                                        <option value="closed">Fechado</option>
                                                    </select>
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    leftIcon={<Send size={14} />}
                                                    onClick={() => handleSendResponse(ticket.id)}
                                                    disabled={!newResponse.trim()}
                                                >
                                                    Responder
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

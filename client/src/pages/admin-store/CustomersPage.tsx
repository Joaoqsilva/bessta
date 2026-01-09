import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, Calendar, MoreVertical, User, Star, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../services/customerApi';
import type { Customer, Appointment } from '../../types';
import './CustomersPage.css';

// Extended Customer for UI with additional fields
interface CustomerUI extends Omit<Customer, 'id'> {
    id: string;
    totalSpent: number;
}

export const CustomersPage = () => {
    const { store } = useAuth();
    const [customers, setCustomers] = useState<CustomerUI[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerUI | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Load customers from API
    useEffect(() => {
        const loadCustomers = async () => {
            if (!store?.id) return;
            setIsLoading(true);

            try {
                const result = await customerApi.list(store.id);
                if (result.success) {
                    const mappedCustomers: CustomerUI[] = result.customers.map((c: any) => ({
                        id: c._id || c.id,
                        name: c.name,
                        email: c.email || '',
                        phone: c.phone || '',
                        avatar: c.name.substring(0, 2).toUpperCase(),
                        totalAppointments: c.totalVisits || 0,
                        totalSpent: 0, // Backend doesn't calculate this yet, or we can add it? For now 0 or need endpoints stats
                        lastVisit: c.lastVisit ? new Date(c.lastVisit).toISOString() : 'Nunca',
                        notes: c.notes || ''
                    }));
                    setCustomers(mappedCustomers);
                }
            } catch (error) {
                console.error('Error loading customers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCustomers();
    }, [store?.id]);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    const openCustomerDetail = (customer: CustomerUI) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    // Stats
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgAppointments = customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalAppointments, 0) / customers.length) : 0;

    const formatDate = (dateString: string | undefined) => {
        if (!dateString || dateString === 'Nunca') return 'Nunca';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Nunca' : date.toLocaleDateString('pt-BR');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="customers-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">Base de clientes (sincronizada com agendamentos)</p>
                </div>
            </div>

            {/* Stats */}
            <div className="customers-stats">
                <div className="stat-card">
                    <User size={20} className="stat-icon" />
                    <div>
                        <span className="stat-value">{totalCustomers}</span>
                        <span className="stat-label">Total de Clientes</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Calendar size={20} className="stat-icon" />
                    <div>
                        <span className="stat-value">{avgAppointments}</span>
                        <span className="stat-label">Média de Visitas</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Star size={20} className="stat-icon" />
                    <div>
                        <span className="stat-value">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
                        <span className="stat-label">Receita Estimada</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Customers Table */}
            <div className="customers-table-container">
                <table className="customers-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Contato</th>
                            <th>Visitas</th>
                            <th>Última Visita</th>
                            <th>Total Gasto</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} onClick={() => openCustomerDetail(customer)}>
                                <td>
                                    <div className="customer-cell">
                                        <div className="customer-avatar">{customer.avatar}</div>
                                        <div className="customer-info">
                                            <span className="customer-name">{customer.name}</span>
                                            {customer.notes && (
                                                <span className="customer-badge">Nota</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span className="contact-email">{customer.email || '-'}</span>
                                        <span className="contact-phone">{customer.phone || '-'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="visits-count">{customer.totalAppointments}</span>
                                </td>
                                <td>
                                    <span className="last-visit">{formatDate(customer.lastVisit)}</span>
                                </td>
                                <td>
                                    <span className="total-spent">R$ {customer.totalSpent.toLocaleString('pt-BR')}</span>
                                </td>
                                <td>
                                    <button className="row-action" onClick={(e) => { e.stopPropagation(); }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                    <div className="empty-state">
                        <User size={48} className="empty-icon" />
                        <p>Nenhum cliente encontrado nos agendamentos.</p>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={selectedCustomer?.name || ''}
                size="lg"
            >
                {selectedCustomer && (
                    <div className="customer-detail">
                        <div className="detail-header">
                            <div className="detail-avatar">{selectedCustomer.avatar}</div>
                            <div className="detail-info">
                                <h3>{selectedCustomer.name}</h3>
                                <div className="detail-contacts">
                                    <span><Mail size={14} /> {selectedCustomer.email || 'Sem email'}</span>
                                    <span><Phone size={14} /> {selectedCustomer.phone || 'Sem telefone'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-stats">
                            <div className="detail-stat">
                                <span className="detail-stat-value">{selectedCustomer.totalAppointments}</span>
                                <span className="detail-stat-label">Visitas</span>
                            </div>
                            <div className="detail-stat">
                                <span className="detail-stat-value">R$ {selectedCustomer.totalSpent}</span>
                                <span className="detail-stat-label">Total Gasto</span>
                            </div>
                            <div className="detail-stat">
                                <span className="detail-stat-value">{formatDate(selectedCustomer.lastVisit)}</span>
                                <span className="detail-stat-label">Última Visita</span>
                            </div>
                        </div>

                        <div className="detail-actions">
                            <Button variant="primary" leftIcon={<Calendar size={16} />} onClick={() => alert('Vá para a Agenda para criar um novo agendamento.')}>
                                Novo Agendamento
                            </Button>
                            <Button variant="outline" leftIcon={<Phone size={16} />}>
                                Ligar
                            </Button>
                            <Button variant="outline" leftIcon={<Mail size={16} />}>
                                Enviar Email
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

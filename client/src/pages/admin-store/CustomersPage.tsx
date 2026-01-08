import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, Calendar, MoreVertical, User, Star } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { getStoreCustomers, saveStoreCustomers } from '../../context/StoreDataService';
import type { Customer } from '../../types';
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerUI | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Load customers from store-specific storage
    useEffect(() => {
        if (store?.id) {
            const storeCustomers = getStoreCustomers(store.id);
            // Convert to UI format
            const uiCustomers: CustomerUI[] = storeCustomers.map(c => ({
                ...c,
                id: c.id.toString(),
                totalSpent: 0, // Calculate from appointments if needed
            }));
            setCustomers(uiCustomers);
        }
    }, [store?.id]);

    // Save customers whenever they change
    const updateCustomers = (newCustomers: CustomerUI[]) => {
        setCustomers(newCustomers);
        if (store?.id) {
            // Convert back to storage format
            const storageCustomers: Customer[] = newCustomers.map(c => ({
                id: parseInt(c.id) || Date.now(),
                name: c.name,
                email: c.email,
                phone: c.phone,
                avatar: c.avatar,
                totalAppointments: c.totalAppointments,
                lastVisit: c.lastVisit,
                joinedAt: c.joinedAt,
                notes: c.notes,
            }));
            saveStoreCustomers(store.id, storageCustomers);
        }
    };

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: '',
    });

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        const newCustomer: CustomerUI = {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            avatar: formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            totalAppointments: 0,
            lastVisit: 'Nunca',
            joinedAt: new Date().toISOString(),
            totalSpent: 0,
            notes: formData.notes,
        };
        updateCustomers([newCustomer, ...customers]);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', phone: '', notes: '' });
    };

    const openCustomerDetail = (customer: CustomerUI) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    // Stats
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgAppointments = customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalAppointments, 0) / customers.length) : 0;

    return (
        <div className="customers-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">Gerencie sua base de clientes</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Adicionar Cliente
                </Button>
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
                        <span className="stat-label">Receita Total</span>
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
                                                <span className="customer-badge">{customer.notes}</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span className="contact-email">{customer.email}</span>
                                        <span className="contact-phone">{customer.phone}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="visits-count">{customer.totalAppointments}</span>
                                </td>
                                <td>
                                    <span className="last-visit">{customer.lastVisit}</span>
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
                        <p>Nenhum cliente encontrado</p>
                    </div>
                )}
            </div>

            {/* Add Customer Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Adicionar Cliente"
                description="Preencha os dados do novo cliente"
            >
                <form onSubmit={handleAddCustomer}>
                    <Input
                        label="Nome Completo"
                        placeholder="Ex: Carlos Santos"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="cliente@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                        label="Telefone"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                    <Input
                        label="Observações"
                        placeholder="Notas sobre o cliente..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Adicionar
                        </Button>
                    </div>
                </form>
            </Modal>

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
                                    <span><Mail size={14} /> {selectedCustomer.email}</span>
                                    <span><Phone size={14} /> {selectedCustomer.phone}</span>
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
                                <span className="detail-stat-value">{selectedCustomer.lastVisit}</span>
                                <span className="detail-stat-label">Última Visita</span>
                            </div>
                        </div>

                        <div className="detail-actions">
                            <Button variant="primary" leftIcon={<Calendar size={16} />}>
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

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, Zap } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal, ConfirmDialog } from '../../components/Modal';
import { Input, TextArea } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { getStoreServices, saveStoreServices } from '../../context/StoreDataService';
import type { Service } from '../../types';
import './ServicesPage.css';

export const ServicesPage = () => {
    const { store } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // Load services from store-specific storage
    useEffect(() => {
        if (store?.id) {
            const storeServices = getStoreServices(store.id);
            setServices(storeServices);
        }
    }, [store?.id]);

    // Save services whenever they change
    const updateServices = (newServices: Service[]) => {
        setServices(newServices);
        if (store?.id) {
            saveStoreServices(store.id, newServices);
        }
    };

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 30,
        price: 0,
    });

    const resetForm = () => {
        setFormData({ name: '', description: '', duration: 30, price: 0 });
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const newService: Service = {
            id: Date.now(),
            name: formData.name,
            description: formData.description,
            duration: formData.duration,
            durationDisplay: `${formData.duration} min`,
            price: formData.price,
            currency: 'BRL',
            isActive: true,
        };
        updateServices([...services, newService]);
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;

        const updated = services.map(s =>
            s.id === selectedService.id
                ? {
                    ...s,
                    name: formData.name,
                    description: formData.description,
                    duration: formData.duration,
                    durationDisplay: `${formData.duration} min`,
                    price: formData.price,
                }
                : s
        );
        updateServices(updated);
        setIsEditModalOpen(false);
        setSelectedService(null);
        resetForm();
    };

    const handleDelete = () => {
        if (!selectedService) return;
        updateServices(services.filter(s => s.id !== selectedService.id));
        setIsDeleteDialogOpen(false);
        setSelectedService(null);
    };

    const openEditModal = (service: Service) => {
        setSelectedService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            duration: service.duration,
            price: service.price,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (service: Service) => {
        setSelectedService(service);
        setIsDeleteDialogOpen(true);
    };

    const toggleServiceActive = (id: number) => {
        updateServices(services.map(s =>
            s.id === id ? { ...s, isActive: !s.isActive } : s
        ));
    };

    const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);
    const avgDuration = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0;

    return (
        <div className="services-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Serviços</h1>
                    <p className="page-subtitle">Gerencie os serviços oferecidos pela sua loja</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Adicionar Serviço
                </Button>
            </div>

            {/* Stats */}
            <div className="services-stats">
                <div className="stat-card">
                    <Zap size={20} className="stat-icon" />
                    <div>
                        <span className="stat-value">{services.length}</span>
                        <span className="stat-label">Serviços Ativos</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Clock size={20} className="stat-icon" />
                    <div>
                        <span className="stat-value">{avgDuration} min</span>
                        <span className="stat-label">Duração Média</span>
                    </div>
                </div>
                <div className="stat-card">
                    <DollarSign size={20} className="stat-icon" />
                    <div>
                        <span className="stat-value">R$ {(totalRevenue / services.length).toFixed(0)}</span>
                        <span className="stat-label">Preço Médio</span>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="services-grid">
                {services.map(service => (
                    <div key={service.id} className={`service-card ${!service.isActive ? 'inactive' : ''}`}>
                        <div className="service-header">
                            <div className="service-info">
                                <h3 className="service-name">{service.name}</h3>
                                {service.description && (
                                    <p className="service-description">{service.description}</p>
                                )}
                            </div>
                            <div className="service-actions">
                                <button
                                    className="action-btn"
                                    onClick={() => openEditModal(service)}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="action-btn danger"
                                    onClick={() => openDeleteDialog(service)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="service-details">
                            <div className="service-detail">
                                <Clock size={16} />
                                <span>{service.durationDisplay}</span>
                            </div>
                            <div className="service-detail price">
                                <DollarSign size={16} />
                                <span>R$ {service.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="service-footer">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={service.isActive}
                                    onChange={() => toggleServiceActive(service.id)}
                                />
                                <span className="toggle-slider" />
                            </label>
                            <span className="toggle-label">
                                {service.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <button className="add-service-card" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={24} />
                    <span>Adicionar Serviço</span>
                </button>
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); resetForm(); }}
                title="Adicionar Serviço"
                description="Preencha os dados do novo serviço"
            >
                <form onSubmit={handleAdd}>
                    <Input
                        label="Nome do Serviço"
                        placeholder="Ex: Corte Clássico"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <TextArea
                        label="Descrição"
                        placeholder="Descreva o serviço..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="form-row">
                        <Input
                            label="Duração (min)"
                            type="number"
                            min={5}
                            step={5}
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            required
                        />
                        <Input
                            label="Preço (R$)"
                            type="number"
                            min={0}
                            step={0.01}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Adicionar
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); resetForm(); }}
                title="Editar Serviço"
            >
                <form onSubmit={handleEdit}>
                    <Input
                        label="Nome do Serviço"
                        placeholder="Ex: Corte Clássico"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <TextArea
                        label="Descrição"
                        placeholder="Descreva o serviço..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="form-row">
                        <Input
                            label="Duração (min)"
                            type="number"
                            min={5}
                            step={5}
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            required
                        />
                        <Input
                            label="Preço (R$)"
                            type="number"
                            min={0}
                            step={0.01}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Salvar
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Serviço"
                message={`Tem certeza que deseja excluir "${selectedService?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                variant="danger"
            />
        </div>
    );
};

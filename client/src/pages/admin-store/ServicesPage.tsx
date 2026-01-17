import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, Zap, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal, ConfirmDialog } from '../../components/Modal';
import { Input, TextArea } from '../../components/Input';
import { useAuth, type Service } from '../../context/AuthContext';
import { serviceApi } from '../../services/serviceApi';
import { showSuccess, showError } from '../../utils/toast';
import './ServicesPage.css';

export const ServicesPage = () => {
    const { store } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 30,
        price: 0,
    });

    const loadServices = async () => {
        if (!store?.id) return;
        setIsLoading(true);
        try {
            const result = await serviceApi.list(store.id);
            if (result.success) {
                // Adaptando _id para id se necessário
                const adaptedServices = result.services.map(s => ({
                    ...s,
                    id: s._id || s.id,
                    durationDisplay: `${s.duration} min`
                }));
                setServices(adaptedServices);
            }
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load services from API
    useEffect(() => {
        loadServices();
    }, [store?.id]);

    const resetForm = () => {
        setFormData({ name: '', description: '', duration: 30, price: 0 });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store?.id) return;

        setIsProcessing(true);
        try {
            const result = await serviceApi.create({
                storeId: store.id,
                name: formData.name,
                description: formData.description,
                duration: formData.duration,
                price: formData.price,
                currency: 'BRL'
            });

            if (result.success) {
                await loadServices();
                setIsAddModalOpen(false);
                resetForm();
            } else {
                showError('Erro ao criar serviço');
            }
        } catch (error) {
            console.error('Create service error:', error);
            showError('Erro ao criar serviço');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !selectedService._id) return;

        setIsProcessing(true);
        try {
            const result = await serviceApi.update(selectedService._id, {
                name: formData.name,
                description: formData.description,
                duration: formData.duration,
                price: formData.price,
            });

            if (result.success) {
                await loadServices();
                setIsEditModalOpen(false);
                setSelectedService(null);
                resetForm();
            } else {
                showError('Erro ao atualizar serviço');
            }
        } catch (error) {
            console.error('Update service error:', error);
            showError('Erro ao atualizar serviço');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedService || !selectedService._id) return;

        setIsProcessing(true);
        try {
            const result = await serviceApi.delete(selectedService._id);
            if (result.success) {
                await loadServices();
                setIsDeleteDialogOpen(false);
                setSelectedService(null);
            } else {
                showError('Erro ao excluir serviço');
            }
        } catch (error) {
            console.error('Delete service error:', error);
            showError('Erro ao excluir serviço');
        } finally {
            setIsProcessing(false);
        }
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

    const toggleServiceActive = async (service: Service) => {
        if (!service._id) return;

        // Optimistic update
        const newStatus = !service.isActive;
        setServices(prev => prev.map(s => s._id === service._id ? { ...s, isActive: newStatus } : s));

        try {
            await serviceApi.update(service._id, { isActive: newStatus });
        } catch (error) {
            console.error('Error toggling status:', error);
            // Revert on error
            setServices(prev => prev.map(s => s._id === service._id ? { ...s, isActive: !newStatus } : s));
        }
    };

    const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);
    const avgDuration = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0;

    if (isLoading && services.length === 0) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="services-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Serviços</h1>
                    <p className="page-subtitle">Gerencie os serviços oferecerem pela sua loja</p>
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
                        <span className="stat-value">R$ {(totalRevenue / (services.length || 1)).toFixed(0)}</span>
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
                                <span>{service.durationDisplay || `${service.duration} min`}</span>
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
                                    onChange={() => toggleServiceActive(service)}
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
                        <Button type="submit" variant="primary" isLoading={isProcessing}>
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
                        <Button type="submit" variant="primary" isLoading={isProcessing}>
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
                isLoading={isProcessing}
            />
        </div>
    );
};

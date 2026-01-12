import { useState, useEffect } from 'react';
import { Search, Edit2, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../services/appointmentApi';
import type { Appointment } from '../../types';

export const AppointmentsPage = () => {
    const { store } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Load appointments
    useEffect(() => {
        const loadAppointments = async () => {
            if (!store?.id) return;

            setIsLoading(true);
            try {
                const result = await appointmentApi.list(store.id);
                if (result.success) {
                    // Mapeamento para garantir compatibilidade de id
                    const mapped = result.appointments.map(apt => ({
                        ...apt,
                        id: apt._id || apt.id
                    })) as Appointment[];

                    setAppointments(mapped);
                    setFilteredAppointments(mapped);
                }
            } catch (error) {
                console.error('Error loading appointments:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointments();
    }, [store?.id]);

    // Filter logic
    useEffect(() => {
        let result = appointments;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(apt =>
                apt.customerName.toLowerCase().includes(lowerTerm) ||
                apt.serviceName.toLowerCase().includes(lowerTerm) ||
                apt.customerEmail?.toLowerCase().includes(lowerTerm)
            );
        }

        if (filterStatus !== 'all') {
            result = result.filter(apt => apt.status === filterStatus);
        }

        // Sort by date desc
        result.sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

        setFilteredAppointments(result);
    }, [appointments, searchTerm, filterStatus]);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            cancelled: 'bg-red-100 text-red-700',
            completed: 'bg-gray-100 text-gray-700',
        };

        const labels: Record<string, string> = {
            confirmed: 'Confirmado',
            pending: 'Pendente',
            cancelled: 'Cancelado',
            completed: 'Concluído',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (isLoading && appointments.length === 0) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
                    <p className="text-gray-500">Histórico completo de atendimentos</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, serviço..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none bg-white"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="pending">Pendentes</option>
                        <option value="confirmed">Confirmados</option>
                        <option value="completed">Concluídos</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Cliente</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Serviço</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Data & Hora</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Status</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Valor</th>
                            <th className="text-right py-4 px-6 font-medium text-gray-600 text-sm">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400">
                                    Nenhum agendamento encontrado
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map(apt => (
                                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">
                                                {apt.avatar || apt.customerName[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{apt.customerName}</div>
                                                <div className="text-xs text-gray-400">{apt.customerPhone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">{apt.serviceName}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">
                                                {new Date(apt.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={10} /> {apt.time}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {getStatusBadge(apt.status)}
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-900">
                                        R$ {apt.servicePrice}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

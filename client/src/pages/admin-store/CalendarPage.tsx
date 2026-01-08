import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { getStoreAppointments, saveStoreAppointments } from '../../context/StoreDataService';
import type { Appointment } from '../../types';
import './CalendarPage.css';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Default available time slots for booking
const DEFAULT_TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
];

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        confirmed: 'var(--success-500)',
        pending: 'var(--warning-500)',
        completed: 'var(--surface-400)',
        cancelled: 'var(--error-500)',
        in_progress: 'var(--primary-500)',
    };
    return colors[status] || 'var(--surface-400)';
};

export const CalendarPage = () => {
    const { store } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Time slots management - per day of week (0 = Sunday, 6 = Saturday)
    type WeeklyTimeSlots = Record<number, string[]>;
    const defaultWeeklySlots: WeeklyTimeSlots = {
        0: [], // Sunday - closed by default
        1: DEFAULT_TIME_SLOTS,
        2: DEFAULT_TIME_SLOTS,
        3: DEFAULT_TIME_SLOTS,
        4: DEFAULT_TIME_SLOTS,
        5: DEFAULT_TIME_SLOTS,
        6: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'], // Saturday - shorter hours
    };

    const [weeklyTimeSlots, setWeeklyTimeSlots] = useState<WeeklyTimeSlots>(defaultWeeklySlots);
    const [isManagingSlotsMode, setIsManagingSlotsMode] = useState(false);
    const [newSlotTime, setNewSlotTime] = useState('');
    const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
    const [editingSlotValue, setEditingSlotValue] = useState('');

    // Get selected day of week
    const selectedDayOfWeek = selectedDate ? selectedDate.getDay() : 1;
    const availableTimeSlots = weeklyTimeSlots[selectedDayOfWeek] || [];
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    // Load appointments and time slots from store-specific storage
    useEffect(() => {
        if (store?.id) {
            const storeAppointments = getStoreAppointments(store.id);
            setAppointments(storeAppointments);

            // Load custom weekly time slots
            const savedSlots = localStorage.getItem(`bessta_weekly_slots_${store.id}`);
            if (savedSlots) {
                setWeeklyTimeSlots(JSON.parse(savedSlots));
            }
        }
    }, [store?.id]);

    // Save time slots for a specific day
    const saveTimeSlots = (slots: string[]) => {
        const sortedSlots = [...slots].sort();
        const newWeeklySlots = { ...weeklyTimeSlots, [selectedDayOfWeek]: sortedSlots };
        setWeeklyTimeSlots(newWeeklySlots);
        if (store?.id) {
            localStorage.setItem(`bessta_weekly_slots_${store.id}`, JSON.stringify(newWeeklySlots));
        }
    };

    // Add new time slot
    const handleAddSlot = () => {
        if (newSlotTime && !availableTimeSlots.includes(newSlotTime)) {
            saveTimeSlots([...availableTimeSlots, newSlotTime]);
            setNewSlotTime('');
        }
    };

    // Delete time slot
    const handleDeleteSlot = (slot: string) => {
        saveTimeSlots(availableTimeSlots.filter(s => s !== slot));
    };

    // Edit time slot
    const handleSaveEditSlot = () => {
        if (editingSlotIndex !== null && editingSlotValue) {
            const newSlots = [...availableTimeSlots];
            newSlots[editingSlotIndex] = editingSlotValue;
            saveTimeSlots(newSlots);
            setEditingSlotIndex(null);
            setEditingSlotValue('');
        }
    };

    // Save appointments 
    const updateAppointments = (newAppointments: Appointment[]) => {
        setAppointments(newAppointments);
        if (store?.id) {
            saveStoreAppointments(store.id, newAppointments);
        }
    };

    // Form state
    const [newCustomer, setNewCustomer] = useState('');
    const [newService, setNewService] = useState('');
    const [newTime, setNewTime] = useState('');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const getAppointmentsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.filter(apt => apt.date === dateStr);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    };

    const handleDayClick = (day: number) => {
        setSelectedDate(new Date(year, month, day));
    };

    const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

    const handleAddAppointment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !newCustomer || !newService || !newTime) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        const dateStr = selectedDate.toISOString().split('T')[0];

        const newAppointment: Appointment = {
            id: Date.now(),
            storeId: store?.id || 'store-001',
            customerName: newCustomer,
            customerPhone: '',
            serviceId: 1,
            serviceName: newService,
            serviceDuration: 60,
            servicePrice: 50,
            date: dateStr,
            time: newTime,
            endTime: newTime,
            status: 'pending',
            avatar: newCustomer.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
        };

        updateAppointments([newAppointment, ...appointments]);
        setIsAddModalOpen(false);
        setNewCustomer('');
        setNewService('');
        setNewTime('');
    };

    // Generate calendar days
    const calendarDays = [];

    // Empty cells for days before start of month
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayAppointments = getAppointmentsForDate(date);
        const hasAppointments = dayAppointments.length > 0;

        calendarDays.push(
            <div
                key={day}
                className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${hasAppointments ? 'has-appointments' : ''}`}
                onClick={() => handleDayClick(day)}
            >
                <span className="day-number">{day}</span>
                {hasAppointments && (
                    <div className="day-appointments">
                        {dayAppointments.slice(0, 3).map((apt, idx) => (
                            <div
                                key={apt.id}
                                className="day-appointment-dot"
                                style={{ backgroundColor: getStatusColor(apt.status) }}
                                title={`${apt.time} - ${apt.customerName}`}
                            />
                        ))}
                        {dayAppointments.length > 3 && (
                            <span className="more-appointments">+{dayAppointments.length - 3}</span>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="calendar-page">
            <div className="calendar-header">
                <div className="calendar-header-left">
                    <h1 className="page-title">Calendário</h1>
                    <p className="page-subtitle">Visualize e gerencie seus agendamentos</p>
                </div>
                <div className="calendar-header-right">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Hoje
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus size={16} />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Novo Agendamento
                    </Button>
                </div>
            </div>

            <div className="calendar-container">
                {/* Calendar Grid */}
                <div className="calendar-main">
                    <div className="calendar-nav">
                        <div className="calendar-nav-controls">
                            <button className="nav-btn" onClick={prevMonth}>
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="calendar-month-title">
                                {MONTHS[month]} {year}
                            </h2>
                            <button className="nav-btn" onClick={nextMonth}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="view-mode-selector">
                            <button
                                className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
                                onClick={() => setViewMode('month')}
                            >
                                Mês
                            </button>
                            <button
                                className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
                                onClick={() => setViewMode('week')}
                            >
                                Semana
                            </button>
                            <button
                                className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
                                onClick={() => setViewMode('day')}
                            >
                                Dia
                            </button>
                        </div>
                    </div>

                    <div className="calendar-grid">
                        <div className="calendar-weekdays">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        <div className="calendar-days">
                            {calendarDays}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="calendar-legend">
                        <div className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: 'var(--success-500)' }} />
                            <span>Confirmado</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: 'var(--warning-500)' }} />
                            <span>Pendente</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: 'var(--primary-500)' }} />
                            <span>Em Andamento</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: 'var(--surface-400)' }} />
                            <span>Concluído</span>
                        </div>
                    </div>
                </div>

                {/* Day Detail Sidebar */}
                <div className="calendar-sidebar">
                    <div className="sidebar-header">
                        <h3 className="sidebar-title">
                            {selectedDate ? selectedDate.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            }) : 'Selecione um dia'}
                        </h3>
                        <span className="appointments-badge">
                            {selectedDateAppointments.length} agendamentos
                        </span>
                    </div>

                    <div className="sidebar-appointments">
                        {selectedDateAppointments.length === 0 ? (
                            <div className="no-appointments">
                                <Clock size={32} className="empty-icon" />
                                <p>Nenhum agendamento para este dia</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    Adicionar
                                </Button>
                            </div>
                        ) : (
                            <div className="appointments-timeline">
                                {selectedDateAppointments.map(apt => (
                                    <div key={apt.id} className="timeline-item">
                                        <div
                                            className="timeline-marker"
                                            style={{ backgroundColor: getStatusColor(apt.status) }}
                                        />
                                        <div className="timeline-content">
                                            <div className="timeline-time">{apt.time}</div>
                                            <div className="timeline-card">
                                                <div className="timeline-customer">
                                                    <User size={14} />
                                                    <span>{apt.customerName}</span>
                                                </div>
                                                <div className="timeline-service">{apt.serviceName}</div>
                                                <div className="timeline-duration">
                                                    <Clock size={12} />
                                                    <span>{apt.serviceDuration} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Time Slots */}
                    <div className="time-slots-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                                <h4 className="slots-title" style={{ margin: 0 }}>Horários Disponíveis</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 500 }}>
                                    📅 {dayNames[selectedDayOfWeek]}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsManagingSlotsMode(!isManagingSlotsMode)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    fontSize: '0.75rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--surface-200)',
                                    background: isManagingSlotsMode ? 'var(--primary-100)' : 'transparent',
                                    color: isManagingSlotsMode ? 'var(--primary-700)' : 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {isManagingSlotsMode ? <X size={12} /> : <Edit2 size={12} />}
                                {isManagingSlotsMode ? 'Fechar' : 'Gerenciar'}
                            </button>
                        </div>

                        {/* Info about day-specific slots */}
                        {isManagingSlotsMode && (
                            <div style={{
                                background: 'var(--primary-50)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                marginBottom: '12px',
                                fontSize: '0.8rem',
                                color: 'var(--primary-700)'
                            }}>
                                💡 Editando horários para <strong>{dayNames[selectedDayOfWeek]}</strong>.
                                Selecione outro dia no calendário para editar seus horários.
                            </div>
                        )}

                        {/* Add new slot when in management mode */}
                        {isManagingSlotsMode && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    type="time"
                                    value={newSlotTime}
                                    onChange={(e) => setNewSlotTime(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--surface-200)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button
                                    onClick={handleAddSlot}
                                    disabled={!newSlotTime}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        fontSize: '0.85rem',
                                        cursor: newSlotTime ? 'pointer' : 'not-allowed',
                                        opacity: newSlotTime ? 1 : 0.5
                                    }}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}

                        <div className="time-slots-grid" style={{ gap: isManagingSlotsMode ? '8px' : undefined }}>
                            {availableTimeSlots.map((slot: string, idx: number) => {
                                const isBooked = selectedDateAppointments.some(apt => apt.time === slot);

                                // Edit mode for this slot
                                if (isManagingSlotsMode && editingSlotIndex === idx) {
                                    return (
                                        <div key={slot} style={{ display: 'flex', gap: '4px' }}>
                                            <input
                                                type="time"
                                                value={editingSlotValue}
                                                onChange={(e) => setEditingSlotValue(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--primary-300)',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                            <button
                                                onClick={handleSaveEditSlot}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    background: 'var(--success-500)',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => { setEditingSlotIndex(null); setEditingSlotValue(''); }}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    background: 'var(--surface-200)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    );
                                }

                                // Management mode view
                                if (isManagingSlotsMode) {
                                    return (
                                        <div
                                            key={slot}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--surface-200)',
                                                background: 'var(--surface-50)'
                                            }}
                                        >
                                            <span style={{ fontWeight: 500 }}>{slot}</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => { setEditingSlotIndex(idx); setEditingSlotValue(slot); }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        border: 'none',
                                                        background: 'var(--primary-100)',
                                                        color: 'var(--primary-700)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSlot(slot)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        border: 'none',
                                                        background: 'var(--error-100)',
                                                        color: 'var(--error-600)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                // Normal booking mode
                                return (
                                    <button
                                        key={slot}
                                        className={`time-slot ${isBooked ? 'booked' : 'available'}`}
                                        disabled={isBooked}
                                        onClick={() => {
                                            setNewTime(slot);
                                            setIsAddModalOpen(true);
                                        }}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Appointment Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Novo Agendamento"
                description={selectedDate ? `Para ${selectedDate.toLocaleDateString('pt-BR')}` : ''}
            >
                <form onSubmit={handleAddAppointment}>
                    <Input
                        label="Nome do Cliente"
                        placeholder="Ex: Carlos Santos"
                        value={newCustomer}
                        onChange={(e) => setNewCustomer(e.target.value)}
                        required
                    />
                    <Input
                        label="Serviço"
                        placeholder="Ex: Corte + Barba"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        required
                    />
                    <Input
                        label="Horário"
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        required
                    />
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Agendar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

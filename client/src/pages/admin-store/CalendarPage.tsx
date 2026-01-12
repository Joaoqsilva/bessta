import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../services/appointmentApi';
import { serviceApi } from '../../services/serviceApi';
import { storeApi } from '../../services/storeApi';
import type { Appointment, Service } from '../../types';
import './CalendarPage.css';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        confirmed: 'var(--success-500)',
        pending: 'var(--warning-500)',
        completed: 'var(--surface-400)',
        cancelled: 'var(--error-500)',
    };
    return colors[status] || 'var(--surface-400)';
};

export const CalendarPage = () => {
    const { store } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Time slots management - per day of week (0 = Sunday, 6 = Saturday)
    type WeeklyTimeSlots = Record<number, string[]>;
    const defaultWeeklySlots: WeeklyTimeSlots = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };

    const [weeklyTimeSlots, setWeeklyTimeSlots] = useState<WeeklyTimeSlots>(defaultWeeklySlots);
    const [isManagingSlotsMode, setIsManagingSlotsMode] = useState(false);
    const [newSlotTime, setNewSlotTime] = useState('');
    const [selectedDaysToAdd, setSelectedDaysToAdd] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri

    const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
    const [editingSlotValue, setEditingSlotValue] = useState('');
    const [editingSlotOriginal, setEditingSlotOriginal] = useState('');
    const [editingSlotDays, setEditingSlotDays] = useState<number[]>([]);

    // Get selected day of week
    const selectedDayOfWeek = selectedDate ? selectedDate.getDay() : 1;
    const availableTimeSlots = weeklyTimeSlots[selectedDayOfWeek] || [];

    const loadAppointments = async () => {
        if (!store?.id) return;
        setIsLoading(true);
        try {
            const result = await appointmentApi.list(store.id);
            if (result.success) {
                const mapped = result.appointments.map(apt => ({
                    ...apt,
                    id: apt._id || apt.id
                })) as Appointment[];
                setAppointments(mapped);
            }



            // Load services
            const servicesResult = await serviceApi.list(store.id);
            if (servicesResult.success) {
                const mappedServices = servicesResult.services.map(s => ({
                    ...s,
                    id: s._id || s.id
                }));
                setServices(mappedServices);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, [store?.id]);

    const [storeWeeklySlots, setStoreWeeklySlots] = useState<WeeklyTimeSlots>(defaultWeeklySlots);

    // Initial load from store context or API
    useEffect(() => {
        if (store?.weeklyTimeSlots) {
            setWeeklyTimeSlots(store.weeklyTimeSlots);
        } else if (store?.id) {
            // Fetch if not in context
            storeApi.getById(store.id).then(res => {
                if (res.success && res.store.weeklyTimeSlots) {
                    setWeeklyTimeSlots(res.store.weeklyTimeSlots);
                }
            });
        }
    }, [store]);

    const saveTimeSlots = async (newWeeklySlots: WeeklyTimeSlots) => {
        setWeeklyTimeSlots(newWeeklySlots);
        if (store?.id) {
            try {
                // Save to backend
                await storeApi.updateWeeklySlots(store.id, newWeeklySlots);
            } catch (error) {
                console.error("Failed to save slots", error);
                alert("Erro ao salvar horários. Tente novamente.");
            }
        }
    };

    const handleAddSlot = () => {
        if (!newSlotTime) return;

        const newWeeklySlots = { ...weeklyTimeSlots };
        const daysTarget = selectedDaysToAdd.length > 0 ? selectedDaysToAdd : [selectedDayOfWeek];

        daysTarget.forEach(dayIndex => {
            const currentSlots = newWeeklySlots[dayIndex] || [];
            if (!currentSlots.includes(newSlotTime)) {
                newWeeklySlots[dayIndex] = [...currentSlots, newSlotTime].sort();
            }
        });

        // Trigger save
        saveTimeSlots(newWeeklySlots);
        setNewSlotTime('');
    };

    const handleDeleteSlot = (slot: string) => {
        // filter for current day
        const currentSlots = weeklyTimeSlots[selectedDayOfWeek] || [];
        const updatedSlots = currentSlots.filter(s => s !== slot);

        const newWeeklySlots = { ...weeklyTimeSlots, [selectedDayOfWeek]: updatedSlots };
        saveTimeSlots(newWeeklySlots);
    };

    const handleStartEditing = (slot: string, idx: number) => {
        setEditingSlotIndex(idx);
        setEditingSlotValue(slot);
        setEditingSlotOriginal(slot);

        const daysWithSlot: number[] = [];
        Object.entries(weeklyTimeSlots).forEach(([dayStr, slots]) => {
            if (slots.includes(slot)) {
                daysWithSlot.push(parseInt(dayStr));
            }
        });
        setEditingSlotDays(daysWithSlot);
    };

    const handleSaveEditSlot = () => {
        if (editingSlotIndex !== null && editingSlotValue && editingSlotOriginal) {
            const newWeeklySlots = { ...weeklyTimeSlots };

            // 1. Remove original slot from ALL days where it might exist
            Object.keys(newWeeklySlots).forEach(key => {
                const dayIndex = parseInt(key);
                newWeeklySlots[dayIndex] = newWeeklySlots[dayIndex].filter(s => s !== editingSlotOriginal);
            });

            // 2. Add new slot time to ALL currently selected days
            editingSlotDays.forEach(dayIndex => {
                const currentSlots = newWeeklySlots[dayIndex] || [];
                if (!currentSlots.includes(editingSlotValue)) {
                    newWeeklySlots[dayIndex] = [...currentSlots, editingSlotValue].sort();
                }
            });

            // Trigger save
            saveTimeSlots(newWeeklySlots);

            setEditingSlotIndex(null);
            setEditingSlotValue('');
            setEditingSlotOriginal('');
            setEditingSlotDays([]);
        }
    };

    const handleCancelEdit = () => {
        setEditingSlotIndex(null);
        setEditingSlotValue('');
        setEditingSlotOriginal('');
        setEditingSlotDays([]);
    };

    // Form state
    const [newCustomer, setNewCustomer] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newServiceId, setNewServiceId] = useState('');
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
        // Create a local date string YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const searchDateStr = `${year}-${month}-${day}`;

        return appointments.filter(apt => {
            // apt.date comes from API as ISO string (UTC)
            // We need to check if the appointment time (in local time) matches the selected date
            const aptDate = new Date(apt.date);
            const aptYear = aptDate.getFullYear();
            const aptMonth = String(aptDate.getMonth() + 1).padStart(2, '0');
            const aptDay = String(aptDate.getDate()).padStart(2, '0');
            const aptDateStr = `${aptYear}-${aptMonth}-${aptDay}`;

            return aptDateStr === searchDateStr;
        });
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

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !newCustomer || !newServiceId || !newTime || !store?.id) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        setIsProcessing(true);

        try {
            const selectedService = services.find(s => s.id === newServiceId);
            const result = await appointmentApi.create({
                storeId: store.id,
                customerName: newCustomer,
                customerPhone: newPhone,
                serviceId: newServiceId,
                date: (() => {
                    const [h, m] = newTime.split(':').map(Number);
                    const d = new Date(selectedDate);
                    d.setHours(h, m, 0, 0);
                    return d.toISOString();
                })(),
                notes: selectedService ? selectedService.name : '',
            });

            if (result.success) {
                await loadAppointments();
                setIsAddModalOpen(false);
                setNewCustomer('');
                setNewPhone('');
                setNewServiceId('');
                setNewTime('');
                alert('Agendamento criado com sucesso!');
            }
        } catch (error: any) {
            console.error('Create appointment error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido ao criar agendamento';
            alert(`Erro: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Generate calendar days
    const calendarDays: React.ReactNode[] = [];

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

    const renderHelper = () => {
        // Month View
        if (viewMode === 'month') {
            return (
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
            );
        }

        // Week View
        if (viewMode === 'week') {
            const startOfWeek = new Date(selectedDate || new Date());
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Go to Sunday

            return (
                <div className="week-view-grid">
                    {DAYS_OF_WEEK.map((dayName, idx) => {
                        const d = new Date(startOfWeek);
                        d.setDate(d.getDate() + idx);

                        // Local date string for comparison
                        const dYear = d.getFullYear();
                        const dMonth = String(d.getMonth() + 1).padStart(2, '0');
                        const dDay = String(d.getDate()).padStart(2, '0');
                        const searchDateStr = `${dYear}-${dMonth}-${dDay}`;

                        const dayApts = appointments.filter(a => {
                            const aDate = new Date(a.date);
                            const aYear = aDate.getFullYear();
                            const aMonth = String(aDate.getMonth() + 1).padStart(2, '0');
                            const aDay = String(aDate.getDate()).padStart(2, '0');
                            const aDateStr = `${aYear}-${aMonth}-${aDay}`;
                            return aDateStr === searchDateStr;
                        });

                        const isToday = new Date().toDateString() === d.toDateString();

                        return (
                            <div key={idx} className="week-day-card">
                                <div className={`week-day-header ${isToday ? 'today' : ''}`}>
                                    {dayName}
                                    <span className="week-date">{d.getDate()}/{d.getMonth() + 1}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {dayApts.map(apt => (
                                        <div key={apt.id} className="week-appointment" style={{
                                            borderLeftColor: getStatusColor(apt.status)
                                        }}>
                                            <strong>{apt.time}</strong> {apt.customerName}
                                        </div>
                                    ))}
                                    {dayApts.length === 0 && <span className="week-empty-state">-</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            );
        }

        // Day View
        if (viewMode === 'day') {
            const d = selectedDate || new Date();

            const dYear = d.getFullYear();
            const dMonth = String(d.getMonth() + 1).padStart(2, '0');
            const dDay = String(d.getDate()).padStart(2, '0');
            const searchDateStr = `${dYear}-${dMonth}-${dDay}`;

            const dayApts = appointments.filter(a => {
                const aDate = new Date(a.date);
                const aYear = aDate.getFullYear();
                const aMonth = String(aDate.getMonth() + 1).padStart(2, '0');
                const aDay = String(aDate.getDate()).padStart(2, '0');
                const aDateStr = `${aYear}-${aMonth}-${aDay}`;
                return aDateStr === searchDateStr;
            });

            // Simple hourly grid 08:00 - 20:00
            const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20

            return (
                <div className="day-view-container">
                    <div className="day-view-header">
                        {d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    {hours.map(h => {
                        const timePrefix = h.toString().padStart(2, '0');
                        const hourApts = dayApts.filter(a => a.time.startsWith(timePrefix));

                        return (
                            <div key={h} className="day-view-hour-row">
                                <div className="day-view-hour-label">{timePrefix}:00</div>
                                <div className="day-view-hour-content">
                                    {hourApts.map(apt => (
                                        <div key={apt.id} className="day-view-appointment" style={{
                                            borderLeftColor: getStatusColor(apt.status)
                                        }}>
                                            {apt.time} - {apt.customerName} ({apt.serviceName})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }
    };

    if (isLoading && appointments.length === 0) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary-600" /></div>;
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

            <div className="admin-calendar-container">
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

                    {renderHelper()}

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
                            <span className="legend-dot" style={{ backgroundColor: 'var(--surface-400)' }} />
                            <span>Concluído</span>
                        </div>
                    </div>
                </div>

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

                    <div className="time-slots-section">
                        <div className="slot-management-header">
                            <div>
                                <h4 className="slots-title">Horários Disponíveis</h4>
                            </div>
                            <button
                                onClick={() => setIsManagingSlotsMode(!isManagingSlotsMode)}
                                className={`slot-management-toggle ${isManagingSlotsMode ? 'active' : ''}`}
                            >
                                {isManagingSlotsMode ? <X size={12} /> : <Edit2 size={12} />}
                                {isManagingSlotsMode ? 'Fechar' : 'Gerenciar'}
                            </button>
                        </div>

                        {isManagingSlotsMode && (
                            <div className="slot-add-section">
                                <div className="slot-add-controls">
                                    <input
                                        type="time"
                                        value={newSlotTime}
                                        onChange={(e) => setNewSlotTime(e.target.value)}
                                        className="slot-time-input"
                                    />
                                    <button
                                        onClick={handleAddSlot}
                                        disabled={!newSlotTime}
                                        className="slot-add-btn"
                                    >
                                        <Plus size={14} />
                                        <span>Adicionar</span>
                                    </button>
                                </div>

                                <div className="slot-add-days">
                                    <label className="slot-days-label">
                                        Adicionar para os dias:
                                    </label>
                                    <div className="slot-days-grid">
                                        {DAYS_OF_WEEK.map((dayName, idx) => (
                                            <label key={idx} className={`slot-day-checkbox ${selectedDaysToAdd.includes(idx) ? 'active' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDaysToAdd.includes(idx)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedDaysToAdd([...selectedDaysToAdd, idx]);
                                                        } else {
                                                            setSelectedDaysToAdd(selectedDaysToAdd.filter(d => d !== idx));
                                                        }
                                                    }}
                                                />
                                                {dayName}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="time-slots-grid" style={{ gap: isManagingSlotsMode ? '8px' : undefined }}>
                            {availableTimeSlots.map((slot: string, idx: number) => {
                                const isBooked = selectedDateAppointments.some(apt => apt.time === slot);

                                if (isManagingSlotsMode && editingSlotIndex === idx) {
                                    return (
                                        <div key={slot} className="slot-edit-card">
                                            <div className="slot-edit-controls">
                                                <input
                                                    type="time"
                                                    value={editingSlotValue}
                                                    onChange={(e) => setEditingSlotValue(e.target.value)}
                                                    className="slot-time-input"
                                                />
                                                <button onClick={handleSaveEditSlot} className="slot-action-btn success">
                                                    ✓
                                                </button>
                                                <button onClick={handleCancelEdit} className="slot-action-btn neutral">
                                                    <X size={12} />
                                                </button>
                                            </div>

                                            <div className="slot-edit-days">
                                                <label className="slot-days-label">
                                                    Aplicar em:
                                                </label>
                                                <div className="slot-days-grid">
                                                    {DAYS_OF_WEEK.map((dayName, dIdx) => (
                                                        <label key={dIdx} className={`slot-day-checkbox ${editingSlotDays.includes(dIdx) ? 'active' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={editingSlotDays.includes(dIdx)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setEditingSlotDays([...editingSlotDays, dIdx]);
                                                                    } else {
                                                                        setEditingSlotDays(editingSlotDays.filter(d => d !== dIdx));
                                                                    }
                                                                }}
                                                            />
                                                            {dayName}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (isManagingSlotsMode) {
                                    return (
                                        <div key={slot} className="slot-management-item">
                                            <span className="slot-time">{slot}</span>
                                            <div className="slot-management-actions">
                                                <button onClick={() => handleStartEditing(slot, idx)} className="slot-action-btn primary">
                                                    <Edit2 size={12} />
                                                </button>
                                                <button onClick={() => handleDeleteSlot(slot)} className="slot-action-btn danger">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

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

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Novo Agendamento"
                description={selectedDate ? `Para ${selectedDate.toLocaleDateString('pt-BR')}` : ''}
            >
                <form onSubmit={handleAddAppointment}>
                    {services.length === 0 && (
                        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
                            Atenção: Você não possui serviços cadastrados. Cadastre serviços na página de Serviços para continuar.
                        </div>
                    )}
                    <Input
                        label="Nome do Cliente"
                        placeholder="Ex: Carlos Santos"
                        value={newCustomer}
                        onChange={(e) => setNewCustomer(e.target.value)}
                        required
                    />
                    <Input
                        label="Telefone"
                        placeholder="Ex: (11) 99999-9999"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        required
                    />
                    <Select
                        label="Serviço"
                        options={services.map(s => ({
                            value: s.id as string,
                            label: `${s.name} - R$ ${s.price}`
                        }))}
                        value={newServiceId}
                        onChange={(e) => setNewServiceId(e.target.value)}
                        required
                        placeholder="Selecione um serviço"
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
                        <Button type="submit" variant="primary" isLoading={isProcessing} disabled={services.length === 0}>
                            Agendar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Check, ChevronLeft, ChevronRight, User, Mail, Phone, Loader2, Sun, Moon } from 'lucide-react';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { useAuth } from '../context/AuthContext';
import { serviceApi } from '../services/serviceApi';
import { appointmentApi } from '../services/appointmentApi';
import type { Service, Appointment, Store } from '../types';
import type { StoreCustomization } from '../context/StoreCustomizationService';
import { formatPhone } from '../utils/formatters';

// Reusing styles from StoreBookingPage is the best way to ensure consistency
// We just need to make sure the parent doesn't override wizard specific styles if we add any.

interface BookingWizardProps {
    store: Store;
    customization?: StoreCustomization;
    isOpen: boolean;
    onClose: () => void;
}

type BookingStep = 'service' | 'date' | 'time' | 'details' | 'confirmation';

interface CustomerData {
    name: string;
    email: string;
    phone: string;
    notes: string;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Default weekly slots initialized as empty
type WeeklyTimeSlots = Record<number, string[]>;
const getDefaultWeeklySlots = (): WeeklyTimeSlots => ({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
});

export const BookingWizard = ({ store, customization, isOpen, onClose }: BookingWizardProps) => {
    const { user } = useAuth();
    const [step, setStep] = useState<BookingStep>('service');
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [customerData, setCustomerData] = useState<CustomerData>({
        name: user?.ownerName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [weeklyTimeSlots, setWeeklyTimeSlots] = useState<WeeklyTimeSlots>(getDefaultWeeklySlots());
    const [storeAppointments, setStoreAppointments] = useState<Appointment[]>([]);

    // Update customer data when user changes (e.g., login)
    useEffect(() => {
        if (user) {
            setCustomerData(prev => ({
                ...prev,
                name: prev.name || user.ownerName || user.name || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || ''
            }));
        }
    }, [user]);


    useEffect(() => {
        const loadData = async () => {
            if (isOpen && store) {
                setIsLoading(true);
                try {
                    // Load Services
                    const serviceRes = await serviceApi.list(store.id);
                    if (serviceRes.success) {
                        const mapped = serviceRes.services.map(s => ({
                            ...s,
                            id: s._id || s.id,
                            durationDisplay: `${s.duration} min`
                        })) as Service[];
                        setServices(mapped);
                    }

                    // Load Appointments (to check availability)
                    let currentAppointments: Appointment[] = [];
                    const aptRes = await appointmentApi.list(store.id);
                    if (aptRes.success) {
                        currentAppointments = aptRes.appointments.map(a => ({
                            ...a,
                            id: a._id || a.id
                        })) as Appointment[];
                        setStoreAppointments(currentAppointments);
                    }

                    // Load weekly time slots
                    let currentSlots = getDefaultWeeklySlots();
                    if (store.weeklyTimeSlots && Object.keys(store.weeklyTimeSlots).length > 0) {
                        setWeeklyTimeSlots(store.weeklyTimeSlots);
                        currentSlots = store.weeklyTimeSlots;
                    } else {
                        setWeeklyTimeSlots(getDefaultWeeklySlots());
                    }

                    // Reset state
                    setStep('service');
                    setSelectedService(null);

                    // Auto-select next available date
                    const findNextAvailableDate = () => {
                        const d = new Date();
                        d.setHours(0, 0, 0, 0);

                        // Check next 30 days
                        for (let i = 0; i < 30; i++) {
                            const dayOfWeek = d.getDay();
                            if (currentSlots[dayOfWeek] && currentSlots[dayOfWeek].length > 0) {
                                return new Date(d);
                            }
                            d.setDate(d.getDate() + 1);
                        }
                        return null;
                    };

                    const nextDate = findNextAvailableDate();
                    if (nextDate) {
                        setSelectedDate(nextDate);
                        setCurrentMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
                    } else {
                        setSelectedDate(null);
                    }

                    setSelectedTime(null);
                    setIsSubmitting(false);

                } catch (error) {
                    console.error('Error loading booking data:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadData();
    }, [isOpen, store?.id]); // Usar store?.id em vez de store objeto para evitar loop se store mudar ref

    // Get available time slots for the selected date (filtering out booked slots)
    const getAvailableSlotsForDate = (date: Date | null): string[] => {
        if (!date) return [];
        const dayOfWeek = date.getDay();
        const allSlots = weeklyTimeSlots[dayOfWeek] || [];

        // Get the date string in YYYY-MM-DD format
        const dateStr = date.toISOString().split('T')[0];

        // Get appointments for this specific date
        // Note: Backend might store UTC ISO dates. This simple string comparison assumes local date or consistent format.
        // ideally, we check if appointment ranges overlap with slots. 
        // For now, let's assume direct date string match or verify intersection.
        // Actually, appointmentApi list returns whatever backend sends. 
        // If backend sends full ISO, apt.date might contain time "2023-01-01T14:00:00.000Z".
        // Our simple logic here assumes 'date' field is 'YYYY-MM-DD' OR we parse it.

        const appointmentsForDate = storeAppointments.filter(apt => {
            const aptDate = apt.date.split('T')[0];
            return aptDate === dateStr && apt.status !== 'cancelled';
        });

        // Filter out slots that are already booked
        // If appointment stores just 'time' (HH:mm), we use that. 
        // If it stores full date, we extract time.
        // Based on my changes, appointment now stores full date ISO.

        const bookedTimes = appointmentsForDate.map(apt => {
            if (apt.time) return apt.time; // Legacy/frontend prop
            // Extract from ISO
            const d = new Date(apt.date);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        });

        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

        return availableSlots;
    };

    if (!isOpen) return null;

    // Calendar Helpers
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDayOfMonth.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isDateSelectable = (date: Date) => {
        if (date < today) return false;
        const dayOfWeek = date.getDay();
        // Check if the day has available time slots
        const slotsForDay = weeklyTimeSlots[dayOfWeek] || [];
        return slotsForDay.length > 0;
    };

    const handleDateSelect = (day: number) => {
        const date = new Date(year, month, day);
        if (isDateSelectable(date)) {
            setSelectedDate(date);
            setSelectedTime(null);
            // Avança automaticamente para a etapa de hora
            setStep('time');
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        // Avança automaticamente para a etapa de dados
        setStep('details');
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const handlePrevMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        if (newDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
            setCurrentMonth(newDate);
        }
    };

    const handleBack = () => {
        if (step === 'date') setStep('service');
        else if (step === 'time') setStep('date');
        else if (step === 'details') setStep('time');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store || !selectedService || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);

        try {
            // Combine Date and Time correctly
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const appointmentDateTime = new Date(selectedDate);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            const result = await appointmentApi.create({
                storeId: store.id,
                customerName: customerData.name,
                customerEmail: customerData.email,
                customerPhone: customerData.phone,
                serviceId: selectedService.id.toString(),
                date: appointmentDateTime.toISOString(),
                notes: customerData.notes
            });

            if (result.success) {
                setStep('confirmation');
            } else {
                alert('Ocorreu um erro ao realizar o agendamento. Tente novamente.');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Ocorreu um erro ao realizar o agendamento. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Logic
    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty w-10 h-10" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isSelectable = isDateSelectable(date);
        const isSelected = selectedDate &&
            day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

        calendarDays.push(
            <button
                key={day}
                className={`calendar-day w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isSelectable ? 'disabled' : ''}`}
                onClick={() => handleDateSelect(day)}
                disabled={!isSelectable}
                type="button"
            >
                {day}
            </button>
        );
    }

    // Dynamic Style for Active Step
    const primaryColor = customization?.primaryColor || '#2563eb';

    const modalContent = (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{
                '--store-primary': primaryColor,
                zIndex: 999999,
                backgroundColor: 'rgba(0,0,0,0.7)'
            } as any}
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-3xl h-auto max-h-[90vh] m-4 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Fechar"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                {/* Progress Header */}
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 text-center">
                    <div className="booking-progress mb-0 bg-transparent shadow-none p-0 !gap-3">
                        <div className={`progress-step ${step === 'service' ? 'active' : ''} ${['date', 'time', 'details', 'confirmation'].includes(step) ? 'completed' : ''}`}>
                            <div className="step-number">1</div>
                            <span className="step-label">Serviço</span>
                        </div>
                        <div className="progress-line" />
                        <div className={`progress-step ${step === 'date' ? 'active' : ''} ${['time', 'details', 'confirmation'].includes(step) ? 'completed' : ''}`}>
                            <div className="step-number">2</div>
                            <span className="step-label">Data</span>
                        </div>
                        <div className="progress-line" />
                        <div className={`progress-step ${step === 'time' ? 'active' : ''} ${['details', 'confirmation'].includes(step) ? 'completed' : ''}`}>
                            <div className="step-number">3</div>
                            <span className="step-label">Hora</span>
                        </div>
                        <div className="progress-line" />
                        <div className={`progress-step ${step === 'details' ? 'active' : ''} ${step === 'confirmation' ? 'completed' : ''}`}>
                            <div className="step-number">4</div>
                            <span className="step-label">Seus Dados</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 booking-page">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {/* STEP 1: SERVICE */}
                            {step === 'service' && (
                                <div className="booking-step shadow-none p-0">
                                    <h2 className="step-title text-center mb-8">Escolha um Serviço</h2>
                                    {services.length === 0 ? (
                                        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                                            <p>Nenhum serviço disponível no momento.</p>
                                        </div>
                                    ) : (
                                        <div className="services-list grid gap-4">
                                            {services.map(service => (
                                                <button
                                                    key={service.id}
                                                    className={`service-option w-full group ${selectedService?.id === service.id ? 'selected shadow-md ring-2 ring-primary-500' : 'hover:bg-gray-50'}`}
                                                    onClick={() => {
                                                        setSelectedService(service);
                                                        setStep('date');
                                                    }}
                                                >
                                                    <div className="service-main text-left">
                                                        <h3 className="service-name group-hover:text-primary-600">{service.name}</h3>
                                                        <p className="service-description">{service.description}</p>
                                                    </div>
                                                    <div className="service-meta text-right">
                                                        <div className="service-duration flex items-center justify-end gap-1 mb-1 text-gray-400">
                                                            <Clock size={14} />
                                                            {service.durationDisplay}
                                                        </div>
                                                        <div className="service-price font-bold text-lg text-primary-600">
                                                            {service.currency} {service.price}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: DATE */}
                            {step === 'date' && (
                                <div className="booking-step shadow-none p-0 flex flex-col items-center justify-center">
                                    <button onClick={handleBack} className="back-btn mb-4 hover:underline self-start">
                                        <ChevronLeft size={16} /> Voltar
                                    </button>
                                    <h2 className="step-title text-center mb-4">Escolha a Data</h2>

                                    <div className="flex justify-center w-full">
                                        {/* Calendar */}
                                        <div className="booking-calendar-container w-full max-w-md bg-gray-50 p-5 rounded-2xl">
                                            <div className="calendar-header flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-lg text-gray-800">
                                                    {MONTHS[month]} {year}
                                                </h3>
                                                <div className="flex gap-1">
                                                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                                                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                                                </div>
                                            </div>
                                            <div className="calendar-grid grid grid-cols-7 gap-2 justify-items-center">
                                                {DAYS_OF_WEEK.map(d => (
                                                    <div key={d} className="text-center text-sm font-semibold text-gray-400 uppercase py-2">{d}</div>
                                                ))}
                                                {calendarDays}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: TIME */}
                            {step === 'time' && (
                                <div className="booking-step shadow-none p-0 flex flex-col items-center">
                                    <button onClick={handleBack} className="back-btn mb-3 hover:underline self-start">
                                        <ChevronLeft size={16} /> Voltar
                                    </button>
                                    <h2 className="step-title text-center mb-1">Escolha o Horário</h2>
                                    {selectedDate && (
                                        <p className="text-center text-primary-600 font-medium mb-4 animate-in fade-in">
                                            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                    )}

                                    <div className="time-slots-container w-full">
                                        {(() => {
                                            const slots = getAvailableSlotsForDate(selectedDate);

                                            if (slots.length === 0) {
                                                return (
                                                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                                                        <Clock size={32} className="mb-2 opacity-20" />
                                                        <p className="font-medium">Sem horários disponíveis</p>
                                                        <p className="text-sm opacity-70">Tente outra data</p>
                                                    </div>
                                                );
                                            }

                                            const periods = [
                                                { label: 'Manhã', icon: Sun, filter: (h: number) => h < 12 },
                                                { label: 'Tarde', icon: Sun, filter: (h: number) => h >= 12 && h < 18 },
                                                { label: 'Noite', icon: Moon, filter: (h: number) => h >= 18 }
                                            ];

                                            return (
                                                <div className="space-y-4">
                                                    {periods.map(period => {
                                                        const periodSlots = slots.filter(t => period.filter(parseInt(t.split(':')[0])));
                                                        if (periodSlots.length === 0) return null;

                                                        return (
                                                            <div key={period.label} className="animate-in slide-in-from-bottom-4 duration-500">
                                                                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                                    <period.icon size={14} className={period.label === 'Noite' ? 'text-indigo-400' : 'text-orange-400'} />
                                                                    {period.label}
                                                                </h4>
                                                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                                                    {periodSlots.map(time => (
                                                                        <button
                                                                            key={time}
                                                                            onClick={() => handleTimeSelect(time)}
                                                                            className={`btn-time-slot ${selectedTime === time ? 'selected' : ''}`}
                                                                        >
                                                                            {time}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: DETAILS */}
                            {step === 'details' && (
                                <div className="booking-step shadow-none p-0 flex flex-col md:flex-row gap-12">
                                    <div className="flex-1">
                                        <button onClick={handleBack} className="back-btn mb-6 hover:underline">
                                            <ChevronLeft size={16} /> Voltar
                                        </button>
                                        <h2 className="step-title mb-2">Seus Dados</h2>
                                        <p className="text-gray-500 mb-8">Preencha suas informações para confirmar.</p>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <Input
                                                label="Nome Completo"
                                                placeholder="Seu nome"
                                                value={customerData.name}
                                                onChange={e => setCustomerData({ ...customerData, name: e.target.value })}
                                                leftIcon={<User size={18} />}
                                                required
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    value={customerData.email}
                                                    onChange={e => setCustomerData({ ...customerData, email: e.target.value })}
                                                    leftIcon={<Mail size={18} />}
                                                    required
                                                />
                                                <Input
                                                    label="Telefone"
                                                    placeholder="(11) 99999-9999"
                                                    value={customerData.phone}
                                                    onChange={e => setCustomerData({ ...customerData, phone: formatPhone(e.target.value) })}
                                                    leftIcon={<Phone size={18} />}
                                                    required
                                                />
                                            </div>
                                            <TextArea
                                                label="Observações (opcional)"
                                                placeholder="Alguma preferência?"
                                                value={customerData.notes}
                                                onChange={e => setCustomerData({ ...customerData, notes: e.target.value })}
                                            />

                                            <div className="pt-4">
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                    isLoading={isSubmitting}
                                                >
                                                    Confirmar Agendamento
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* CONFIRMATION */}
                            {step === 'confirmation' && (
                                <div className="confirmation-screen text-center py-12">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                                        <Check size={40} />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Agendamento Confirmado!</h1>
                                    <p className="text-gray-500 mb-10 max-w-md mx-auto">
                                        Seu horário foi reservado com sucesso. Enviamos os detalhes para seu email e WhatsApp.
                                    </p>

                                    <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                        <div className="space-y-3">
                                            <div className="flex justify-between p-2 border-b border-gray-200/50">
                                                <span className="text-gray-500">Serviço</span>
                                                <span className="font-medium">{selectedService?.name}</span>
                                            </div>
                                            <div className="flex justify-between p-2 border-b border-gray-200/50">
                                                <span className="text-gray-500">Data e Hora</span>
                                                <span className="font-medium">{selectedDate?.toLocaleDateString()} às {selectedTime}</span>
                                            </div>
                                            <div className="flex justify-between p-2">
                                                <span className="text-gray-500">Profissional</span>
                                                <span className="font-medium">{store.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button size="lg" onClick={onClose}>
                                        Fechar e Voltar ao Site
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Render modal using portal to escape any parent overflow/transform issues
    return createPortal(modalContent, document.body);
};

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Check, ChevronLeft, ChevronRight, User, Mail, Phone } from 'lucide-react';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { getStoreServices, getStoreAppointments, addStoreAppointment, getStoreCustomers, addStoreCustomer, updateStoreCustomer } from '../context/StoreDataService';
import type { Service, Appointment, Store, Customer } from '../types';
import type { StoreCustomization } from '../context/StoreCustomizationService';


// Reusing styles from StoreBookingPage is the best way to ensure consistency
// We just need to make sure the parent doesn't override wizard specific styles if we add any.

interface BookingWizardProps {
    store: Store;
    customization?: StoreCustomization;
    isOpen: boolean;
    onClose: () => void;
}

type BookingStep = 'service' | 'datetime' | 'details' | 'confirmation';

interface CustomerData {
    name: string;
    email: string;
    phone: string;
    notes: string;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const DEFAULT_TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
];

// Default weekly slots (same as CalendarPage)
type WeeklyTimeSlots = Record<number, string[]>;
const getDefaultWeeklySlots = (): WeeklyTimeSlots => ({
    0: [], // Sunday - closed
    1: DEFAULT_TIME_SLOTS,
    2: DEFAULT_TIME_SLOTS,
    3: DEFAULT_TIME_SLOTS,
    4: DEFAULT_TIME_SLOTS,
    5: DEFAULT_TIME_SLOTS,
    6: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'], // Saturday
});

export const BookingWizard = ({ store, customization, isOpen, onClose }: BookingWizardProps) => {
    const [step, setStep] = useState<BookingStep>('service');
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [customerData, setCustomerData] = useState<CustomerData>({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [weeklyTimeSlots, setWeeklyTimeSlots] = useState<WeeklyTimeSlots>(getDefaultWeeklySlots());
    const [storeAppointments, setStoreAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        if (isOpen && store) {
            const fetched = getStoreServices(store.id);
            setServices(fetched);

            // Load weekly time slots from localStorage (synced with admin CalendarPage)
            const savedSlots = localStorage.getItem(`bessta_weekly_slots_${store.id}`);
            if (savedSlots) {
                setWeeklyTimeSlots(JSON.parse(savedSlots));
            } else {
                setWeeklyTimeSlots(getDefaultWeeklySlots());
            }

            // Load existing appointments to filter out booked slots
            const appointments = getStoreAppointments(store.id);
            setStoreAppointments(appointments);

            // Reset state on open
            setStep('service');
            setSelectedService(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setIsSubmitting(false);
        }
    }, [isOpen, store]);

    // Get available time slots for the selected date (filtering out booked slots)
    const getAvailableSlotsForDate = (date: Date | null): string[] => {
        if (!date) return [];
        const dayOfWeek = date.getDay();
        const allSlots = weeklyTimeSlots[dayOfWeek] || [];

        // Get the date string in YYYY-MM-DD format
        const dateStr = date.toISOString().split('T')[0];

        // Get appointments for this specific date
        const appointmentsForDate = storeAppointments.filter(apt =>
            apt.date === dateStr && apt.status !== 'cancelled'
        );

        // Filter out slots that are already booked
        const bookedTimes = appointmentsForDate.map(apt => apt.time);
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
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
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

    const handleContinue = () => {
        if (selectedService && selectedDate && selectedTime) {
            setStep('details');
        }
    };

    const handleBack = () => {
        if (step === 'datetime') setStep('service');
        else if (step === 'details') setStep('datetime');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store || !selectedService || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const endDate = new Date(selectedDate);
        endDate.setHours(hours, minutes + selectedService.duration);
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        const appointmentDate = selectedDate.toISOString().split('T')[0];

        const newAppointment: Omit<Appointment, 'id'> = {
            storeId: store.id,
            customerName: customerData.name,
            customerPhone: customerData.phone,
            customerEmail: customerData.email,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            serviceDuration: selectedService.duration,
            servicePrice: selectedService.price,
            date: appointmentDate,
            time: selectedTime,
            endTime: endTime,
            status: 'pending',
            notes: customerData.notes,
            avatar: customerData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
        };

        // Simulate API call
        setTimeout(() => {
            // 1. Save Appointment
            addStoreAppointment(store.id, newAppointment);

            // 2. Sync with Customers Database
            const currentCustomers = getStoreCustomers(store.id);
            const existingCustomer = currentCustomers.find(c =>
                c.email === customerData.email || c.phone === customerData.phone
            );

            if (existingCustomer) {
                // Update existing customer
                updateStoreCustomer(store.id, existingCustomer.id, {
                    totalAppointments: (existingCustomer.totalAppointments || 0) + 1,
                    lastVisit: new Date().toLocaleDateString('pt-BR'),
                    // Could also update name/phone if different, but let's keep it simple
                });
            } else {
                // Create new customer
                const newCustomer: Omit<Customer, 'id'> = {
                    name: customerData.name,
                    email: customerData.email,
                    phone: customerData.phone,
                    avatar: newAppointment.avatar || 'CS',
                    totalAppointments: 1,
                    lastVisit: appointmentDate, // Not exactly "visit" yet but scheduled
                    joinedAt: new Date().toISOString(),
                    notes: customerData.notes,
                };
                addStoreCustomer(store.id, newCustomer);
            }

            setIsSubmitting(false);
            setStep('confirmation');
        }, 1500);
    };

    // Render Logic
    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty" />);
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
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isSelectable ? 'disabled' : ''}`}
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
                className="bg-white w-full max-w-4xl h-[90vh] max-h-[800px] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
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
                <div className="bg-gray-50 border-b border-gray-100 p-8 pt-10 text-center">
                    <div className="booking-progress mb-0 bg-transparent shadow-none p-0 !gap-4">
                        <div className={`progress-step ${step === 'service' ? 'active' : ''} ${['datetime', 'details', 'confirmation'].includes(step) ? 'completed' : ''}`}>
                            <div className="step-number">1</div>
                            <span className="step-label">Serviço</span>
                        </div>
                        <div className="progress-line" />
                        <div className={`progress-step ${step === 'datetime' ? 'active' : ''} ${['details', 'confirmation'].includes(step) ? 'completed' : ''}`}>
                            <div className="step-number">2</div>
                            <span className="step-label">Data e Hora</span>
                        </div>
                        <div className="progress-line" />
                        <div className={`progress-step ${step === 'details' ? 'active' : ''} ${step === 'confirmation' ? 'completed' : ''}`}>
                            <div className="step-number">3</div>
                            <span className="step-label">Seus Dados</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 booking-page">
                    <div className="max-w-3xl mx-auto">

                        {/* STEP 1: SERVICE */}
                        {step === 'service' && (
                            <div className="booking-step shadow-none p-0">
                                <h2 className="step-title text-center mb-8">Escolha um Serviço</h2>
                                <div className="services-list grid gap-4">
                                    {services.map(service => (
                                        <button
                                            key={service.id}
                                            className={`service-option w-full group ${selectedService?.id === service.id ? 'selected shadow-md ring-2 ring-primary-500' : 'hover:bg-gray-50'}`}
                                            onClick={() => {
                                                setSelectedService(service);
                                                setStep('datetime');
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
                            </div>
                        )}

                        {/* STEP 2: DATE & TIME */}
                        {step === 'datetime' && (
                            <div className="booking-step shadow-none p-0">
                                <button onClick={handleBack} className="back-btn mb-6 hover:underline">
                                    <ChevronLeft size={16} /> Voltar
                                </button>
                                <h2 className="step-title text-center mb-8">Escolha a Data e Horário</h2>

                                <div className="datetime-grid flex flex-col md:flex-row gap-8">
                                    {/* Calendar */}
                                    <div className="calendar-container flex-1 bg-gray-50 p-6 rounded-2xl">
                                        <div className="calendar-header flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-lg text-gray-800">
                                                {MONTHS[month]} {year}
                                            </h3>
                                            <div className="flex gap-2">
                                                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronLeft size={18} /></button>
                                                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-200 rounded-lg"><ChevronRight size={18} /></button>
                                            </div>
                                        </div>
                                        <div className="calendar-grid grid grid-cols-7 gap-2 mb-2">
                                            {DAYS_OF_WEEK.map(d => (
                                                <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase">{d}</div>
                                            ))}
                                            {calendarDays}
                                        </div>
                                    </div>

                                    {/* Time Slots */}
                                    <div className="time-slots-container flex-1">
                                        <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                                            <Clock size={18} className="text-primary-500" />
                                            Horários Disponíveis
                                        </h3>

                                        {!selectedDate ? (
                                            <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <Calendar size={32} className="mb-2 opacity-50" />
                                                <p>Selecione uma data primeiro</p>
                                            </div>
                                        ) : getAvailableSlotsForDate(selectedDate).length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <Clock size={32} className="mb-2 opacity-50" />
                                                <p>Nenhum horário disponível</p>
                                                <p className="text-sm">Selecione outra data</p>
                                            </div>
                                        ) : (
                                            <div className="time-slots-grid grid grid-cols-3 gap-3">
                                                {getAvailableSlotsForDate(selectedDate).map(time => (
                                                    <button
                                                        key={time}
                                                        className={`time-slot py-2 px-3 rounded-lg text-sm font-medium border transition-all
                                                            ${selectedTime === time
                                                                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                                            }`}
                                                        onClick={() => handleTimeSelect(time)}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <Button
                                        onClick={handleContinue}
                                        disabled={!selectedDate || !selectedTime}
                                        size="lg"
                                        className="w-full md:w-auto"
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DETAILS */}
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
                                                onChange={e => setCustomerData({ ...customerData, phone: e.target.value })}
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

                                {/* Summary Sidebar */}
                                {/* <div className="w-full md:w-80 bg-gray-50 p-6 rounded-2xl h-fit border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4 pb-4 border-b border-gray-200">Resumo</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Serviço</span>
                                            <span className="font-medium text-gray-900 text-right">{selectedService?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Data</span>
                                            <span className="font-medium text-gray-900">{selectedDate?.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Horário</span>
                                            <span className="font-medium text-gray-900">{selectedTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Duração</span>
                                            <span className="font-medium text-gray-900">{selectedService?.durationDisplay}</span>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center mt-4">
                                            <span className="font-bold text-gray-700">Total</span>
                                            <span className="font-bold text-xl text-primary-600">R$ {selectedService?.price}</span>
                                        </div>
                                    </div>
                                </div> */}
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
                </div>
            </div>
        </div>
    );

    // Render modal using portal to escape any parent overflow/transform issues
    return createPortal(modalContent, document.body);
};

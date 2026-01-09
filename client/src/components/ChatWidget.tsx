import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HelpCircle, User, Mail, ChevronRight, ChevronLeft, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { supportApi } from '../services/platformApi';
import { useAuth } from '../context/AuthContext';
import './ChatWidget.css';

type ChatMode = 'home' | 'faq' | 'ticket' | 'chat';

const FAQ_ITEMS = [
    {
        question: 'Como funciona o teste grátis?',
        answer: 'Você pode usar o plano Starter gratuitamente para sempre, com até 30 agendamentos por mês. Não é necessário cartão de crédito.'
    },
    {
        question: 'Posso cancelar a qualquer momento?',
        answer: 'Sim, não há fidelidade. Você pode cancelar ou mudar de plano quando quiser.'
    },
    {
        question: 'Como recebo os pagamentos?',
        answer: 'Você pode configurar sua conta bancária e receber pagamentos via Pix ou Cartão de Crédito diretamente na plataforma.'
    },
    {
        question: 'Funciona no celular?',
        answer: 'Sim! O sistema é 100% responsivo e funciona em qualquer dispositivo (celular, tablet ou computador).'
    }
];

export const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<ChatMode>('home');
    const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
        { text: 'Olá! Como posso ajudar você hoje?', isUser: false }
    ]);

    // Ticket Form State
    const [ticketData, setTicketData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketSuccess, setTicketSuccess] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && mode === 'home') {
            // Reset state when opening
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleBack = () => {
        if (mode === 'ticket' && ticketSuccess) {
            setTicketSuccess(false);
            setTicketData({ name: '', email: '', subject: '', message: '' });
        }
        setMode('home');
    };

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isAuthenticated && user) {
                // Authenticated Ticket
                await supportApi.create({
                    subject: ticketData.subject,
                    message: ticketData.message,
                    category: 'other',
                    priority: 'medium'
                });
            } else {
                // Guest Ticket
                await supportApi.createPublic({
                    name: ticketData.name,
                    email: ticketData.email,
                    subject: ticketData.subject,
                    message: ticketData.message
                });
            }
            setTicketSuccess(true);
        } catch (error) {
            console.error('Error creating ticket:', error);
            // Show error message logic could go here
        } finally {
            setIsSubmitting(false);
        }
    };

    const startWhatsAppChat = () => {
        // Replace with actual number
        const phoneNumber = '5511999999999';
        const message = 'Olá, gostaria de saber mais sobre o BookMe.';
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button className="chat-toggle-btn animate-bounce-subtle" onClick={handleOpen}>
                    <MessageCircle size={28} />
                    <span className="sr-only">Abrir Chat</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window animate-fade-in-up">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            {mode !== 'home' && (
                                <button className="chat-back-btn" onClick={handleBack}>
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <div className="chat-title-group">
                                <h3 className="chat-title">
                                    {mode === 'home' && 'Atendimento Online'}
                                    {mode === 'faq' && 'Dúvidas Frequentes'}
                                    {mode === 'ticket' && 'Enviar Mensagem'}
                                </h3>
                                <p className="chat-subtitle">
                                    {mode === 'home' && 'Selecione uma opção abaixo'}
                                    {mode === 'ticket' && 'Responderemos por email'}
                                </p>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={handleClose}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="chat-content">

                        {/* HOME MODE */}
                        {mode === 'home' && (
                            <div className="chat-home">
                                <div className="chat-bot-message">
                                    <div className="bot-avatar">
                                        <MessageSquare size={16} />
                                    </div>
                                    <div className="message-bubble">
                                        Olá! 👋 <br />
                                        Sou o assistente virtual do BookMe. Como posso te ajudar hoje?
                                    </div>
                                </div>

                                <div className="chat-options">
                                    <button className="chat-option-btn" onClick={() => setMode('faq')}>
                                        <HelpCircle size={18} className="text-primary" />
                                        <span>Dúvidas Frequentes</span>
                                        <ChevronRight size={16} className="ml-auto opacity-50" />
                                    </button>

                                    <button className="chat-option-btn" onClick={startWhatsAppChat}>
                                        <MessageMessageIcon size={18} className="text-success" />
                                        <span>Falar com Atendente</span>
                                        <span className="badge-new">WhatsApp</span>
                                    </button>

                                    <button className="chat-option-btn" onClick={() => setMode('ticket')}>
                                        <Mail size={18} className="text-warning" />
                                        <span>Enviar Email / Ticket</span>
                                        <ChevronRight size={16} className="ml-auto opacity-50" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* FAQ MODE */}
                        {mode === 'faq' && (
                            <div className="chat-faq">
                                {FAQ_ITEMS.map((item, index) => (
                                    <details key={index} className="faq-item">
                                        <summary className="faq-question">
                                            {item.question}
                                            <ChevronRight size={14} className="faq-icon" />
                                        </summary>
                                        <p className="faq-answer">{item.answer}</p>
                                    </details>
                                ))}
                                <div className="faq-footer">
                                    <p>Não achou o que procurava?</p>
                                    <Button size="sm" variant="outline" onClick={() => setMode('ticket')} fullWidth>
                                        Enviar uma mensagem
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* TICKET MODE */}
                        {mode === 'ticket' && (
                            <div className="chat-ticket">
                                {ticketSuccess ? (
                                    <div className="ticket-success">
                                        <div className="success-icon">
                                            <Mail size={32} />
                                        </div>
                                        <h4>Mensagem Enviada!</h4>
                                        <p>Recebemos sua solicitação e entraremos em contato em breve pelo email informado.</p>
                                        <Button onClick={handleBack} fullWidth>Voltar ao Início</Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleTicketSubmit} className="ticket-form">
                                        {!isAuthenticated && (
                                            <>
                                                <Input
                                                    label="Seu Nome"
                                                    placeholder="Digite seu nome"
                                                    value={ticketData.name}
                                                    onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                                                    required
                                                />
                                                <Input
                                                    label="Seu Email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    value={ticketData.email}
                                                    onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                                                    required
                                                />
                                            </>
                                        )}
                                        <Input
                                            label="Assunto"
                                            placeholder="Sobre o que quer falar?"
                                            value={ticketData.subject}
                                            onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                                            required
                                        />
                                        <div className="form-group">
                                            <label>Mensagem</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={4}
                                                placeholder="Descreva sua dúvida ou problema..."
                                                value={ticketData.message}
                                                onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                                                required
                                            ></textarea>
                                        </div>
                                        <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                                            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom Icon for WhatsApp simulation
const MessageMessageIcon = ({ size, className }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

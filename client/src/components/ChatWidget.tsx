import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HelpCircle, User, ChevronRight, ChevronLeft, Bot } from 'lucide-react';
import { Button } from './Button';
import { Input, TextArea, Select } from './Input';
import { supportApi } from '../services/platformApi';
import './ChatWidget.css';

type View = 'home' | 'faq' | 'ticket' | 'success';

const FAQ_ITEMS = [
    {
        question: 'Como funciona o agendamento?',
        answer: 'Escolha o profissional, selecione o serviço e o horário disponível. Você receberá uma confirmação por WhatsApp e email.'
    },
    {
        question: 'Posso cancelar um agendamento?',
        answer: 'Sim, você pode cancelar através do link enviado na confirmação ou diretamente no painel do usuário, respeitando a política de cancelamento da loja.'
    },
    {
        question: 'Como cadastro minha loja?',
        answer: 'Clique em "Criar Conta" no menu superior, escolha seu plano e preencha os dados do seu negócio. É rápido e fácil!'
    },
    {
        question: 'Quais são as formas de pagamento?',
        answer: 'Cada loja define suas próprias formas de pagamento. A plataforma aceita cartões de crédito para assinaturas de lojistas.'
    }
];

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<View>('home');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'other'
    });

    // Close on click outside
    const widgetRef = useRef<HTMLDivElement>(null);
    /* useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []); */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await supportApi.createPublic(formData);
            setView('success');
            setFormData({ name: '', email: '', subject: '', message: '', category: 'other' });
        } catch (error) {
            console.error('Error submitting ticket:', error);
            alert('Erro ao enviar mensagem. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => (
        <div className="chat-header">
            <div className="chat-header-info">
                <div className="chat-avatar">
                    <Bot size={20} />
                </div>
                <div>
                    <h3>Suporte BookMe</h3>
                    <span className="chat-status">Online agora</span>
                </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
            </button>
        </div>
    );

    const renderHome = () => (
        <div className="chat-content home-view">
            <div className="chat-welcome">
                <p>Olá! 👋 <br /> Como podemos ajudar você hoje?</p>
            </div>

            <div className="chat-options">
                <button className="chat-option-btn" onClick={() => setView('faq')}>
                    <HelpCircle size={20} />
                    <span>Dúvidas Frequentes</span>
                    <ChevronRight size={16} />
                </button>

                <button className="chat-option-btn" onClick={() => setView('ticket')}>
                    <MessageCircle size={20} />
                    <span>Falar com Suporte</span>
                    <ChevronRight size={16} />
                </button>

                <button className="chat-option-btn" onClick={() => window.open('mailto:admin@bookme.com', '_blank')}>
                    <User size={20} />
                    <span>Contato Admin Master</span>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderFAQ = () => (
        <div className="chat-content faq-view">
            <div className="view-header">
                <button className="back-btn" onClick={() => setView('home')}>
                    <ChevronLeft size={20} />
                </button>
                <h4>Dúvidas Frequentes</h4>
            </div>
            <div className="faq-list">
                {FAQ_ITEMS.map((item, index) => (
                    <details key={index} className="faq-item">
                        <summary>
                            {item.question}
                            <ChevronRight size={16} className="faq-chevron" />
                        </summary>
                        <p>{item.answer}</p>
                    </details>
                ))}
            </div>
        </div>
    );

    const renderTicketForm = () => (
        <div className="chat-content ticket-view">
            <div className="view-header">
                <button className="back-btn" onClick={() => setView('home')}>
                    <ChevronLeft size={20} />
                </button>
                <h4>Nova Mensagem</h4>
            </div>
            <form onSubmit={handleSubmit} className="ticket-form">
                <Input
                    label="Seu Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Como devemos te chamar?"
                />
                <Input
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Para receber a resposta"
                />
                <Input
                    label="Assunto"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="Sobre o que é?"
                />
                <TextArea
                    label="Mensagem"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="Descreva sua dúvida ou problema..."
                    rows={4}
                />
                <Button type="submit" fullWidth isLoading={isLoading} rightIcon={<Send size={16} />}>
                    Enviar Mensagem
                </Button>
            </form>
        </div>
    );

    const renderSuccess = () => (
        <div className="chat-content success-view">
            <div className="success-icon">
                <Send size={32} />
            </div>
            <h3>Mensagem Enviada!</h3>
            <p>Recebemos sua solicitação. Nossa equipe entrará em contato pelo email informado em breve.</p>
            <Button variant="outline" onClick={() => setView('home')} fullWidth>
                Voltar ao Início
            </Button>
        </div>
    );

    return (
        <div className={`chat-widget ${isOpen ? 'open' : ''}`} ref={widgetRef}>
            {!isOpen && (
                <button className="chat-trigger-btn" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                    <span className="trigger-label">Ajuda</span>
                </button>
            )}

            {isOpen && (
                <div className="chat-window">
                    {renderHeader()}
                    {view === 'home' && renderHome()}
                    {view === 'faq' && renderFAQ()}
                    {view === 'ticket' && renderTicketForm()}
                    {view === 'success' && renderSuccess()}
                </div>
            )}
        </div>
    );
};

import { Link } from 'react-router-dom';
// import { ChatWidget } from '../../components/ChatWidget'; // Temporariamente desabilitado

// ... existing imports ...

import {
    Calendar,
    Users,
    BarChart3,
    Smartphone,
    Shield,
    Zap,
    Star,
    ArrowRight,
    Check,
    Bell,
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import { Button } from '../../components/Button';
import './LandingPage.css';

const features = [
    {
        icon: Calendar,
        title: 'Agendamento Inteligente',
        description: 'Sistema de calendário intuitivo com visualização clara de horários disponíveis e ocupados.',
    },
    {
        icon: Bell,
        title: 'Notificações em Tempo Real',
        description: 'Acompanhe todos os agendamentos e atualizações diretamente no painel de controle.',
    },
    {
        icon: Users,
        title: 'Gestão de Clientes',
        description: 'Histórico completo de cada cliente, preferências e padrões de agendamento.',
    },
    {
        icon: BarChart3,
        title: 'Relatórios Detalhados',
        description: 'Dashboards com métricas de performance, receita e satisfação dos clientes.',
    },
    {
        icon: Smartphone,
        title: '100% Responsivo',
        description: 'Seus clientes podem agendar de qualquer dispositivo, a qualquer momento.',
    },
    {
        icon: Shield,
        title: 'Seguro e Confiável',
        description: 'Seus dados protegidos com criptografia de ponta e backups automáticos.',
    },
];

const plans = [
    {
        name: 'Starter',
        price: 'Grátis',
        period: 'para sempre',
        description: 'Perfeito para começar',
        features: [
            'Até 30 agendamentos/mês',
            '1 serviço cadastrado',
            'Dashboard básico',
            'Notificações por Email',
            'Suporte por email',
        ],
        cta: 'Começar Grátis',
        popular: false,
    },
    {
        name: 'Profissional',
        price: 'R$ 49',
        period: '/mês',
        description: 'Para profissionais em crescimento',
        features: [
            'Agendamentos ilimitados',
            'Serviços ilimitados',
            'Layouts exclusivos',
            // 'Lembretes via WhatsApp',
            'Notificações por Email',
            'Relatórios avançados',
            'Página personalizada',
            // 'Domínio personalizado', // Disabled temporarily
            'Múltiplos colaboradores',
            'Suporte prioritário',
        ],
        cta: 'Começar Agora',
        popular: true,
    },
];

const testimonials = [
    {
        name: 'Carolina Silva',
        role: 'Dona - Studio de Beleza',
        avatar: 'CS',
        content: 'O SimpliAgenda transformou meu negócio! Reduzi 80% do tempo que gastava no telefone marcando horários.',
        rating: 5,
    },
    {
        name: 'Marcos Oliveira',
        role: 'Barbeiro',
        avatar: 'MO',
        content: 'Meus clientes adoram poder agendar online. Minha agenda está sempre cheia agora!',
        rating: 5,
    },
    {
        name: 'Dr. Patricia Mendes',
        role: 'Psicóloga',
        avatar: 'PM',
        content: 'A organização do sistema praticamente eliminou as faltas dos pacientes. Recomendo muito!',
        rating: 5,
    },
];

export const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="container header-container">
                    <Link to="/" className="landing-logo">
                        <Calendar size={28} className="logo-icon" />
                        <span className="logo-text">SimpliAgenda</span>
                    </Link>

                    <nav className="landing-nav">
                        <a href="#features">Recursos</a>
                        <a href="#pricing">Planos</a>
                        <Link to="/ajuda">Ajuda</Link>
                    </nav>

                    <div className="header-actions">
                        <Link to="/login" className="login-btn">Entrar</Link>
                        <Link to="/register">
                            <Button variant="primary" size="sm">Começar Agora</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-gradient" />
                <div className="hero-bg-mesh" />

                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge animate-fade-in">
                            <Zap size={14} />
                            <span>Sistema #1 de Agendamento no Brasil</span>
                        </div>

                        <h1 className="hero-title animate-fade-in-up">
                            Agende seus clientes com
                            <span className="hero-title-gradient"> inteligência</span>
                        </h1>

                        <p className="hero-description animate-fade-in-up animate-delay-100">
                            Simplifique seu dia a dia com um sistema de agendamento online profissional.
                            Menos trabalho manual, mais tempo para o que importa.
                        </p>

                        <div className="hero-cta animate-fade-in-up animate-delay-200">
                            <Link to="/register">
                                <Button variant="primary" size="xl" rightIcon={<ArrowRight size={20} />}>
                                    Começar Gratuitamente
                                </Button>
                            </Link>
                            <Link to="/psicologa-mariana">
                                <Button variant="outline" size="xl">
                                    Ver Demonstração
                                </Button>
                            </Link>
                        </div>

                        <div className="hero-stats animate-fade-in-up animate-delay-300">
                            <div className="hero-stat">
                                <span className="hero-stat-value">15k+</span>
                                <span className="hero-stat-label">Clientes Ativos</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">500k+</span>
                                <span className="hero-stat-label">Agendamentos/mês</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">4.9</span>
                                <span className="hero-stat-label">Avaliação</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image animate-fade-in-up animate-delay-400">
                        <div className="hero-image-container">
                            {/* Dashboard Preview Mock */}
                            <div className="hero-dashboard-preview">
                                <div className="preview-header">
                                    <div className="preview-dots">
                                        <span /><span /><span />
                                    </div>
                                    <span className="preview-url">simpliagenda.com.br/dashboard</span>
                                </div>
                                <div className="preview-body">
                                    <div className="preview-sidebar" />
                                    <div className="preview-content">
                                        <div className="preview-card-row">
                                            <div className="preview-stat-card" />
                                            <div className="preview-stat-card" />
                                            <div className="preview-stat-card" />
                                        </div>
                                        <div className="preview-main-card" />
                                        <div className="preview-small-cards">
                                            <div className="preview-small-card" />
                                            <div className="preview-small-card" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="hero-float-card hero-float-1 animate-float">
                                <div className="float-icon bg-success-50">
                                    <Check size={16} className="text-success" />
                                </div>
                                <div className="float-text">
                                    <span className="float-title">Novo agendamento!</span>
                                    <span className="float-desc">Carlos • 14:00</span>
                                </div>
                            </div>

                            <div className="hero-float-card hero-float-2 animate-float animate-delay-500">
                                <div className="float-icon bg-primary-50">
                                    <MessageSquare size={16} className="text-primary" />
                                </div>
                                <div className="float-text">
                                    <span className="float-title">Lembrete enviado</span>
                                    <span className="float-desc">Há 5 min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center' }}>
                        <span className="section-badge">Recursos</span>
                        <h2 className="section-title">Tudo que você precisa para crescer</h2>
                        <p className="section-description">
                            Ferramentas poderosas para automatizar seu negócio e encantar seus clientes
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="feature-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="feature-icon">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="how-it-works-section">
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center' }}>
                        <span className="section-badge">Como Funciona</span>
                        <h2 className="section-title">Simples como 1, 2, 3</h2>
                    </div>

                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3 className="step-title">Crie sua conta</h3>
                            <p className="step-description">
                                Em menos de 2 minutos, configure sua loja com seus serviços e horários.
                            </p>
                        </div>
                        <div className="step-arrow">
                            <ChevronRight size={24} />
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3 className="step-title">Compartilhe seu link</h3>
                            <p className="step-description">
                                Divulgue sua página de agendamento nas redes sociais e para clientes.
                            </p>
                        </div>
                        <div className="step-arrow">
                            <ChevronRight size={24} />
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3 className="step-title">Receba agendamentos</h3>
                            <p className="step-description">
                                Clientes agendam 24/7 e você recebe tudo organizado no dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center' }}>
                        <span className="section-badge">Depoimentos</span>
                        <h2 className="section-title">O que dizem nossos clientes</h2>
                    </div>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.name}
                                className="testimonial-card"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                                    ))}
                                </div>
                                <p className="testimonial-content">"{testimonial.content}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{testimonial.avatar}</div>
                                    <div className="testimonial-info">
                                        <span className="testimonial-name">{testimonial.name}</span>
                                        <span className="testimonial-role">{testimonial.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="pricing-section" id="pricing">
                <div className="container">
                    <div className="section-header" style={{ textAlign: 'center' }}>
                        <span className="section-badge">Planos</span>
                        <h2 className="section-title">Escolha o plano ideal para você</h2>
                        <p className="section-description">
                            Comece grátis e faça upgrade quando precisar de mais recursos
                        </p>
                    </div>

                    <div className="pricing-grid">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}
                            >
                                {plan.popular && <div className="pricing-popular-badge">Mais Popular</div>}
                                <div className="pricing-header">
                                    <h3 className="pricing-name">{plan.name}</h3>
                                    <div className="pricing-price">
                                        <span className="pricing-amount">{plan.price}</span>
                                        <span className="pricing-period">{plan.period}</span>
                                    </div>
                                    <p className="pricing-description">{plan.description}</p>
                                </div>
                                <ul className="pricing-features">
                                    {plan.features.map((feature) => (
                                        <li key={feature}>
                                            <Check size={18} className="text-success" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register">
                                    <Button
                                        variant={plan.popular ? 'primary' : 'outline'}
                                        size="lg"
                                        fullWidth
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2 className="cta-title">Pronto para transformar seu negócio?</h2>
                            <p className="cta-description">
                                Junte-se a milhares de profissionais que estão economizando tempo e
                                aumentando seus lucros com o SimpliAgenda.
                            </p>
                            <div className="cta-buttons">
                                <Link to="/register">
                                    <Button variant="primary" size="xl" rightIcon={<ArrowRight size={20} />}>
                                        Criar Conta Grátis
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <div className="footer-logo-icon">S</div>
                                <span>SimpliAgenda</span>
                            </div>
                            <p>A solução definitiva para gestão de horários e produtividade.</p>
                        </div>
                        <div className="footer-links">
                            <h4>Produto</h4>
                            <ul>
                                <li><Link to="/register">Preços</Link></li>
                                <li><Link to="/login">Entrar</Link></li>
                                <li><Link to="/ajuda">Como Funciona</Link></li>
                            </ul>
                        </div>
                        <div className="footer-links">
                            <h4>Suporte</h4>
                            <ul>
                                <li><Link to="/ajuda">Central de Ajuda</Link></li>
                                <li><Link to="/ajuda">Documentação</Link></li>
                                <li><a href="https://wa.me/5547991394589" target="_blank" rel="noopener noreferrer">Contato</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} SimpliAgenda. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* <ChatWidget mode="saas" /> */} {/* Temporariamente desabilitado para redesign */}
        </div>
    );
};

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown, ArrowRight, Brain, Heart, Sparkles,
    MessageCircle, Shield, CheckCircle2, Star, Menu, X, Plus, Trash2,
    User as UserIcon, LogOut, CalendarCheck
} from 'lucide-react';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { EditableImage } from '../../components/EditableImage';
import { ClientDashboard } from '../../components/ClientDashboard';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { useAuth } from '../../context/AuthContext';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import './LandingPageTherapy.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageTherapy = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {

    // Configurações e Defaults
    const d = {
        name: store?.name || "Espaço Terapêutico",

        // 1. Hero
        heroLabel: "Saúde Mental & Bem-estar",
        heroTitle: customization?.welcomeTitle || "Reencontre seu equilíbrio emocional",
        heroSubtitle: customization?.welcomeMessage || "Um espaço seguro e acolhedor para sua jornada de autoconhecimento e transformação pessoal.",
        heroCta: "Agendar Sessão",

        // 2. About
        aboutTitle: customization?.aboutTitle || "Sobre mim",
        aboutText: customization?.aboutText || "Com mais de 10 anos de experiência clínica, dedico-me a auxiliar pessoas a superarem desafios emocionais e construírem vidas mais plenas e significativas. Minha abordagem integra técnica e empatia.",

        // 3. Services
        servicesTitle: "Como posso ajudar",

        // 4. Methodology
        methodTitle: "Nossa Jornada",
        methodDesc: "Um processo estruturado para sua evolução",

        // 5. Benefits
        benefitsTitle: "Por que fazer terapia?",

        // 6. Testimonials
        testTitle: "Histórias de transformação",

        // 7. FAQ
        faqTitle: "Dúvidas Frequentes",

        // 8. Footer/Contact
        footerTitle: "Pronto para começar?",
        footerText: "Dê o primeiro passo em direção a uma vida mais leve."
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;

    // Estados
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        // Auto-populate defaults in Editor Mode if empty
        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                onEditAction('init-services__', JSON.stringify(DEFAULT_SERVICES));
            }
            if (!customization?.faq || customization.faq.length === 0) {
                onEditAction('init-faq__', JSON.stringify(DEFAULT_FAQ));
            }
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                onEditAction('init-testimonials__', JSON.stringify(DEFAULT_TESTIMONIALS));
            }
            if (!customization?.team || customization.team.length === 0) {
                const defaultTeam = {
                    team: [
                        { id: '1', name: 'Dra. Ana', role: 'Psicóloga Principal', bio: 'Especialista em traumas e desenvolvimento humano.' }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-team__', JSON.stringify(defaultTeam));
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isEditorMode, onEditAction, customization]);

    const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

    // Dados Mockados para seções repetitivas (seriam dinâmicos no futuro)
    const steps = [1, 2, 3];
    const benefits = [1, 2, 3, 4];

    const DEFAULT_SERVICES = [
        { title: "Ansiedade", description: "Acolhimento e técnicas para lidar com os sintomas e recuperar sua qualidade de vida." },
        { title: "Depressão", description: "Acolhimento e técnicas para lidar com os sintomas e recuperar sua qualidade de vida." },
        { title: "Autoconhecimento", description: "Acolhimento e técnicas para lidar com os sintomas e recuperar sua qualidade de vida." }
    ];

    const DEFAULT_FAQ = [
        { question: "Qual a duração da sessão?", answer: "As sessões duram 50 minutos." },
        { question: "Atende plano de saúde?", answer: "Trabalho com sistema de reembolso." },
        { question: "É presencial ou online?", answer: "Ofereço ambas as modalidades." }
    ];

    const DEFAULT_TESTIMONIALS = {
        testimonials: [
            { text: '"Me senti muito acolhida desde a primeira sessão. Profissional excelente!"', author: "Maria Silva", role: "Paciente", rating: 5 },
            { text: '"Consegui superar meus medos e viver melhor."', author: "Joana D.", role: "Paciente", rating: 5 },
            { text: '"Terapia mudou minha vida."', author: "Carlos R.", role: "Paciente", rating: 5 }
        ],
        images: ["", "", ""]
    };

    return (
        <>
            <div className="therapy-wrapper">

                {/* 1. NAVBAR */}
                <nav className={`therapy-nav ${isScrolled ? 'scrolled' : ''}`}>
                    <div className="therapy-container therapy-nav-inner">
                        <div className="therapy-logo">
                            <EditableText id="th_logo" defaultText={d.name} tagName="span" {...editProps} />
                        </div>

                        {/* Desktop Menu */}
                        <div className="therapy-nav-links hidden md:flex">
                            <a href="#about" className="therapy-nav-link"><EditableText id="th_nav_1" defaultText="Sobre" tagName="span" {...editProps} /></a>
                            <a href="#services" className="therapy-nav-link"><EditableText id="th_nav_2" defaultText="Serviços" tagName="span" {...editProps} /></a>
                            <a href="#methodology" className="therapy-nav-link"><EditableText id="th_nav_3" defaultText="Metodologia" tagName="span" {...editProps} /></a>
                            <a href="#faq" className="therapy-nav-link"><EditableText id="th_nav_4" defaultText="Dúvidas" tagName="span" {...editProps} /></a>
                            <div className="flex items-center gap-4 border-l border-gray-200 pl-4 h-6 mx-2">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => setIsClientDashboardOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--therapy-primary)]/10 text-[var(--therapy-primary)] font-medium text-sm hover:bg-[var(--therapy-primary)]/20 transition-colors"
                                        >
                                            <CalendarCheck size={16} />
                                            <span><EditableText id="th_nav_dashboard" defaultText="Minha Área" tagName="span" {...editProps} /></span>
                                        </button>
                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                            <div className="w-7 h-7 rounded-full bg-[var(--therapy-primary)]/10 flex items-center justify-center text-[var(--therapy-primary)]">
                                                <UserIcon size={14} />
                                            </div>
                                            <span className="text-sm">{user?.ownerName?.split(' ')[0] || 'Usuário'}</span>
                                        </div>
                                        <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Sair">
                                            <LogOut size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--therapy-primary)]"><EditableText id="th_nav_login" defaultText="Entrar" tagName="span" {...editProps} /></button>
                                        <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--therapy-primary)]"><EditableText id="th_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} /></button>
                                    </>
                                )}
                            </div>
                            <button onClick={onBook} className="therapy-btn therapy-btn-primary text-sm">
                                <EditableText id="th_nav_cta" defaultText="Agendar Agora" tagName="span" {...editProps} />
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {mobileMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border-b p-4 flex flex-col gap-4 shadow-lg md:hidden">
                            <a href="#about" onClick={() => setMobileMenuOpen(false)}><EditableText id="th_mob_1" defaultText="Sobre" tagName="span" {...editProps} /></a>
                            <a href="#services" onClick={() => setMobileMenuOpen(false)}><EditableText id="th_mob_2" defaultText="Serviços" tagName="span" {...editProps} /></a>
                            {user ? (
                                <>
                                    <button
                                        onClick={() => { setMobileMenuOpen(false); setIsClientDashboardOpen(true); }}
                                        className="flex items-center gap-2 text-[var(--therapy-primary)] font-semibold"
                                    >
                                        <CalendarCheck size={18} />
                                        <EditableText id="th_mob_dashboard" defaultText="Minha Área" tagName="span" {...editProps} />
                                    </button>
                                    <button
                                        onClick={() => { setMobileMenuOpen(false); logout(); }}
                                        className="flex items-center gap-2 text-red-500 font-medium"
                                    >
                                        <LogOut size={18} />
                                        <EditableText id="th_mob_logout" defaultText="Sair" tagName="span" {...editProps} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                                    className="text-[var(--therapy-primary)] font-semibold"
                                >
                                    <EditableText id="th_mob_login" defaultText="Entrar / Cadastrar" tagName="span" {...editProps} />
                                </button>
                            )}
                            <button onClick={() => { onBook?.(); setMobileMenuOpen(false); }} className="therapy-btn therapy-btn-primary w-full justify-center">
                                <EditableText id="th_mob_cta" defaultText="Agendar" tagName="span" {...editProps} />
                            </button>
                        </div>
                    )}
                </nav>

                {/* 2. HERO SECTION */}
                {customization?.visibleSections?.['hero'] !== false && (
                    <header className="therapy-hero">
                        <div className="therapy-hero-bg"></div>
                        <div className="therapy-container therapy-hero-content">
                            <span className="therapy-hero-label">
                                <EditableText id="th_hero_label" defaultText={d.heroLabel} tagName="span" {...editProps} />
                            </span>
                            <EditableText
                                id="th_hero_title"
                                defaultText={d.heroTitle}
                                className="therapy-hero-title"
                                tagName="h1"
                                {...editProps}
                            />
                            <EditableText
                                id="th_hero_sub"
                                defaultText={d.heroSubtitle}
                                className="therapy-hero-subtitle"
                                tagName="p"
                                {...editProps}
                            />
                            <div className="flex gap-4">
                                <button onClick={onBook} className="therapy-btn therapy-btn-primary">
                                    <EditableText id="th_hero_cta" defaultText={d.heroCta} tagName="span" {...editProps} />
                                    <ArrowRight size={18} />
                                </button>
                                <a href="#about" className="therapy-btn therapy-btn-outline">
                                    <EditableText id="th_hero_cta2" defaultText="Saiba mais" tagName="span" {...editProps} />
                                </a>
                            </div>
                        </div>
                    </header>
                )}

                {/* 3. ABOUT SECTION */}
                {customization?.visibleSections?.['about'] !== false && (
                    <section id="about" className="therapy-about">
                        <div className="therapy-container therapy-about-grid">
                            <div className="therapy-about-img-container group relative">
                                <EditableImage
                                    editKey="aboutImage"
                                    currentSrc={aboutImage}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="therapy-about-img"
                                    label="Alterar Foto"
                                    alt="Therapist"
                                />
                            </div>
                            <div>
                                <EditableText id="th_ab_title" defaultText={d.aboutTitle} className="therapy-section-title" tagName="h2" {...editProps} />
                                <EditableText id="th_ab_text" defaultText={d.aboutText} className="therapy-section-desc" tagName="p" {...editProps} />

                                <div className="grid grid-cols-2 gap-6 mt-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--therapy-primary)]"><EditableText id="th_ab_stat1_num" defaultText="10+" tagName="span" {...editProps} /></h3>
                                        <p className="text-sm text-gray-500"><EditableText id="th_ab_stat1_txt" defaultText="Anos de experiência" tagName="span" {...editProps} /></p>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--therapy-primary)]"><EditableText id="th_ab_stat2_num" defaultText="500+" tagName="span" {...editProps} /></h3>
                                        <p className="text-sm text-gray-500"><EditableText id="th_ab_stat2_txt" defaultText="Pacientes atendidos" tagName="span" {...editProps} /></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. SERVICES SECTION */}
                {customization?.visibleSections?.['services'] !== false && (
                    <section id="services" className="therapy-services">
                        <div className="therapy-container">
                            <div className="text-center max-w-2xl mx-auto">
                                <EditableText id="th_serv_title" defaultText={d.servicesTitle} className="therapy-section-title" tagName="h2" {...editProps} />
                            </div>

                            <div className="therapy-services-grid">
                                {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                    <div key={i} className="therapy-service-card therapy-glass">
                                        <div className="therapy-service-icon">
                                            <EditableIcon id={`th_serv_icon_${i}`} defaultIcon={i === 1 ? "Brain" : i === 2 ? "Heart" : "Sparkles"} size={24} {...editProps} />
                                        </div>
                                        <EditableText id={`th_serv_t_${i}`} defaultText={service.title} className="text-xl font-bold mb-3 block" tagName="h3" {...editProps} />
                                        <EditableText id={`th_serv_d_${i}`} defaultText={service.description} className="text-gray-600 leading-relaxed" tagName="p" {...editProps} />
                                        {isEditorMode && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                                className="absolute top-2 right-2 bg-red-50 p-2 rounded-full text-red-400 hover:bg-red-100/50 hover:text-red-600 transition-colors z-20"
                                                title="Remover Serviço"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditorMode && (
                                    <button
                                        onClick={() => onEditAction?.('service-add')}
                                        className="therapy-service-card therapy-glass border-2 border-dashed border-[var(--therapy-primary)] bg-[var(--therapy-bg)]/50 hover:bg-[var(--therapy-primary)]/10 flex flex-col items-center justify-center cursor-pointer min-h-[250px] transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[var(--therapy-primary)]/10 group-hover:bg-[var(--therapy-primary)]/20 flex items-center justify-center mb-4">
                                            <Plus className="text-[var(--therapy-primary)]" size={24} />
                                        </div>
                                        <span className="font-bold text-[var(--therapy-primary)] text-lg">Adicionar Serviço</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. METHODOLOGY SECTION */}
                {customization?.visibleSections?.['method'] !== false && (
                    <section id="methodology" className="therapy-methodology">
                        <div className="therapy-container">
                            <EditableText id="th_meth_title" defaultText={d.methodTitle} className="text-3xl font-serif mb-4 block" tagName="h2" {...editProps} />
                            <EditableText id="th_meth_desc" defaultText={d.methodDesc} className="opacity-80 max-w-2xl mx-auto block" tagName="p" {...editProps} />

                            <div className="therapy-timeline">
                                {steps.map(i => (
                                    <div key={i} className="therapy-step">
                                        <div className="therapy-step-number">0{i}</div>
                                        <EditableText id={`th_step_t_${i}`} defaultText={i === 1 ? "Avaliação" : i === 2 ? "Intervenção" : "Autonomia"} className="text-xl font-bold mb-2 block" tagName="h3" {...editProps} />
                                        <EditableText id={`th_step_d_${i}`} defaultText="Entendimento profundo das suas necessidades e objetivos terapêuticos." className="text-sm opacity-80 leading-relaxed" tagName="p" {...editProps} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 6. BENEFITS SECTION */}
                {customization?.visibleSections?.['benefits'] !== false && (
                    <section className="therapy-benefits">
                        <div className="therapy-container">
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1">
                                    <EditableText id="th_ben_title" defaultText={d.benefitsTitle} className="therapy-section-title" tagName="h2" {...editProps} />
                                    <div className="therapy-benefits-list">
                                        {benefits.map(i => (
                                            <div key={i} className="therapy-benefit-item">
                                                <CheckCircle2 className="text-[var(--therapy-accent)] flex-shrink-0" />
                                                <EditableText id={`th_ben_${i}`} defaultText="Desenvolvimento de inteligência emocional e resiliência." tagName="span" {...editProps} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 h-[400px] bg-slate-100 rounded-[3rem] relative overflow-hidden group">
                                    <EditableImage
                                        editKey="coverImage"
                                        currentSrc={heroImage}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover"
                                        label="Alterar Imagem"
                                        alt="Wellbeing"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 7. TESTIMONIALS SECTION */}
                {customization?.visibleSections?.['testimonials'] !== false && (
                    <section className="therapy-testimonials">
                        <div className="therapy-container">
                            <div className="text-center mb-12">
                                <EditableText id="th_test_title" defaultText={d.testTitle} className="therapy-section-title" tagName="h2" {...editProps} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : DEFAULT_TESTIMONIALS.testimonials).map((item: any, i: number) => (
                                    <div key={i} className="therapy-review-card relative group">
                                        <div className="flex gap-1 text-yellow-400 mb-4" title={isEditorMode ? "Alterar avaliação" : ""}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star
                                                    key={s}
                                                    size={14}
                                                    className={`cursor-pointer ${s <= (item.rating || 5) ? 'fill-yellow-400' : 'text-gray-300'}`}
                                                    fill={s <= (item.rating || 5) ? "currentColor" : "none"}
                                                    onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                                />
                                            ))}
                                        </div>
                                        <EditableText id={`th_rev_txt_${i}`} defaultText={item.text} className="text-gray-600 italic mb-4 block" tagName="p" {...editProps} />

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative shrink-0">
                                                <EditableImage
                                                    editKey={`testimonialImages__${i}`}
                                                    currentSrc={customization?.testimonialImages?.[i]}
                                                    isEditorMode={isEditorMode}
                                                    onEditAction={onEditAction}
                                                    className="w-full h-full object-cover"
                                                    alt={item.author}
                                                />
                                            </div>
                                            <div>
                                                <EditableText id={`th_rev_auth_${i}`} defaultText={item.author} className="font-bold text-sm block" tagName="span" {...editProps} />
                                                <EditableText id={`cl_test_role_${i}`} defaultText={item.role} className="text-xs text-gray-500 block" tagName="span" {...editProps} />
                                            </div>
                                        </div>
                                        {isEditorMode && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditAction?.('testimonial-remove__' + i); }}
                                                className="absolute top-2 right-2 p-2 text-red-300 hover:text-red-500 transition-colors z-20 opacity-0 group-hover:opacity-100"
                                                title="Remover Depoimento"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditorMode && (
                                    <button
                                        onClick={() => onEditAction?.('testimonial-add')}
                                        className="therapy-review-card border-2 border-dashed border-[var(--therapy-primary)] bg-[var(--therapy-bg)]/50 hover:bg-[var(--therapy-primary)]/10 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors group"
                                    >
                                        <Plus className="text-[var(--therapy-primary)]" size={24} />
                                        <span className="font-bold text-[var(--therapy-heading)]">Adicionar Depoimento</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 8. FAQ SECTION */}
                {customization?.visibleSections?.['faq'] !== false && (
                    <section id="faq" className="therapy-faq">
                        <div className="therapy-container max-w-3xl">
                            <div className="text-center mb-12">
                                <EditableText id="th_faq_title" defaultText={d.faqTitle} className="therapy-section-title" tagName="h2" {...editProps} />
                            </div>
                            <div className="flex flex-col gap-4">
                                {(customization?.faq && customization.faq.length > 0 ? customization.faq : DEFAULT_FAQ).map((f: any, i: number) => (
                                    <div key={i} className="therapy-faq-item">
                                        <div className="therapy-faq-question" onClick={() => toggleFaq(i)}>
                                            <EditableText id={`th_faq_q_${i}`} defaultText={f.question || f.q} tagName="span" {...editProps} />
                                            <ChevronDown className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                        </div>
                                        {openFaq === i && (
                                            <div className="therapy-faq-answer">
                                                <EditableText id={`th_faq_a_${i}`} defaultText={f.answer || f.a} tagName="p" {...editProps} />
                                            </div>
                                        )}
                                        {isEditorMode && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditAction?.('faq-remove__' + i); }}
                                                className="absolute top-4 right-12 text-gray-300 hover:text-red-600 transition-colors z-20"
                                                title="Remover Pergunta"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditorMode && (
                                    <button
                                        onClick={() => onEditAction?.('faq-add')}
                                        className="w-full py-4 border-2 border-dashed border-[var(--therapy-primary)] bg-[var(--therapy-bg)]/50 hover:bg-[var(--therapy-primary)]/10 flex items-center justify-center gap-2 rounded-xl transition-colors group mt-4"
                                    >
                                        <Plus className="text-[var(--therapy-primary)]" size={20} />
                                        <span className="font-bold text-[var(--therapy-heading)]">Adicionar Pergunta</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 9. CONTACT / FOOTER */}
                {customization?.visibleSections?.['contact'] !== false && (
                    <footer className="therapy-footer">
                        <div className="therapy-container">
                            <div className="therapy-footer-cta">
                                <EditableText id="th_ft_title" defaultText={d.footerTitle} className="text-3xl font-serif mb-4 block text-[var(--therapy-heading)]" tagName="h2" {...editProps} />
                                <EditableText id="th_ft_text" defaultText={d.footerText} className="mb-8 block text-[var(--therapy-text)]" tagName="p" {...editProps} />
                                <button onClick={onBook} className="therapy-btn therapy-btn-primary px-8 py-3 text-lg">
                                    Agendar Horário
                                </button>
                            </div>

                            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
                                <div className="flex flex-col gap-2 items-start">
                                    <p>&copy; {new Date().getFullYear()} {d.name}. <EditableText id="th_footer_copy" defaultText="Direitos reservados." tagName="span" {...editProps} /></p>
                                    <StoreFooterRating
                                        storeId={store?.id || 'demo'}
                                        rating={store?.rating}
                                        totalReviews={store?.totalReviews}
                                        color="#2dd4bf"
                                        isEditorMode={isEditorMode}
                                        textColor="rgba(0,0,0,0.6)" // assuming light bg? No, therapy footer has bg-[var(--therapy-bg)] 
                                    // Wait, therapy footer usually has darker bg?
                                    // Let's check styles, but standard is fine. "text-[var(--therapy-text)]" was used above.
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <a href="#" className="hover:text-white"><EditableText id="th_footer_link1" defaultText="Instagram" tagName="span" {...editProps} /></a>
                                    <a href="#" className="hover:text-white"><EditableText id="th_footer_link2" defaultText="WhatsApp" tagName="span" {...editProps} /></a>
                                </div>
                            </div>
                        </div>
                    </footer>
                )}

            </div>

            {/* Auth Modal */}
            <PatientAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                storeId={store?._id || store?.id || ''}
                storeName={d.name}
            />

            {/* Client Dashboard */}
            {isClientDashboardOpen && (
                <ClientDashboard
                    storeId={store?._id || store?.id || ''}
                    storeName={d.name}
                    onClose={() => setIsClientDashboardOpen(false)}
                    onBook={onBook}
                />
            )}
        </>
    );
};

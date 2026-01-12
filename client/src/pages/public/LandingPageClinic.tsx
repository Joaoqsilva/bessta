
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Calendar, Clock, MapPin, Phone, Mail, ChevronRight,
    Star, Shield, User, Heart, Plus, Menu, X, ArrowRight, ChevronDown, Trash2, LogOut, CalendarCheck
} from 'lucide-react';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { StarRating } from '../../components/StarRating';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import './LandingPageClinic.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageClinic = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

    // Default Content
    const d = {
        name: store?.name || "Clínica Integrada",

        // 1. Hero
        heroTitle: customization?.welcomeTitle || "Saúde emocional com uma abordagem multidisciplinar.",
        heroSubtitle: customization?.welcomeMessage || "Nossa equipe de especialistas está pronta para acolher você em um ambiente seguro e humanizado.",

        // 2. Identification
        identTitle: "Você se identifica?",
        identSub: "Podemos ajudar se você sente...",

        // 3. About
        aboutTitle: customization?.aboutTitle || "Nossa Missão",
        aboutText: customization?.aboutText || "Fundada com o propósito de democratizar o acesso à saúde mental de qualidade, nossa clínica reúne profissionais de diversas abordagens terapêuticas. Acreditamos no cuidado integral do ser humano.",

        // 4. Team
        teamTitle: "Nossa Equipe",
        teamSub: "Especialistas dedicados",

        // 5. Services
        servTitle: "Especialidades",

        // 6. Space
        spaceTitle: "Nosso Espaço",

        // 7. Testimonials
        testTitle: "O que dizem sobre nós",

        // 8. FAQ
        faqTitle: "Perguntas Frequentes",

        // 9. Contact
        contactTitle: "Entre em Contato",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    // Images
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;
    const gallery = customization?.galleryImages || [];

    // States
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (idx: number) => setOpenFaq(openFaq === idx ? null : idx);

    // Mock Data
    const problems = ["Ansiedade Constante", "Desânimo e Tristeza", "Conflitos Familiares", "Estresse no Trabalho"];
    const team = [1, 2, 3, 4];
    const services = [1, 2, 3, 4, 5, 6];
    const faqs = [
        { q: "Quais convênios vocês aceitam?", a: "Trabalhamos com sistema de reembolso para a maioria dos planos." },
        { q: "Como agendar uma avaliação?", a: "Você pode agendar diretamente pelo site ou nos chamar no WhatsApp." },
        { q: "Atendem crianças?", a: "Sim, temos psicólogos especializados em ludoterapia." }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);

        // Auto-populate defaults in Editor Mode if empty
        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                const defaultServices = [
                    { id: '1', title: 'Psicoterapia Individual', description: 'Atendimento focado nas necessidades individuais.' },
                    { id: '2', title: 'Terapia de Casal', description: 'Resolução de conflitos e melhoria da comunicação.' },
                    { id: '3', title: 'Terapia Familiar', description: 'Apoio para dinâmicas familiares complexas.' },
                    { id: '4', title: 'Plantão Psicológico', description: 'Acolhimento imediato em crises.' },
                    { id: '5', title: 'Avaliação Neuro', description: 'Diagnóstico detalhado de funções cognitivas.' },
                    { id: '6', title: 'Grupos Terapêuticos', description: 'Troca de experiências mediada por profissional.' }
                ];
                onEditAction('init-services__', JSON.stringify(defaultServices));
            }
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                const defaultTestimonials = {
                    testimonials: [
                        { id: '1', text: 'Melhor decisão que tomei. Profissionais excelentes.', author: 'Ana Silva', role: 'Paciente', rating: 5 },
                        { id: '2', text: 'Ambiente acolhedor e seguro. Recomendo muito.', author: 'Carlos Mendes', role: 'Paciente', rating: 5 },
                        { id: '3', text: 'Me ajudou a superar momentos difíceis com muita empatia.', author: 'Juliana Costa', role: 'Paciente', rating: 5 }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-testimonials__', JSON.stringify(defaultTestimonials));
            }
            if (!customization?.faq || customization.faq.length === 0) {
                const defaultFaq = [
                    { question: "Quais convênios vocês aceitam?", answer: "Trabalhamos com sistema de reembolso para a maioria dos planos." },
                    { question: "Como agendar uma avaliação?", answer: "Você pode agendar diretamente pelo site ou nos chamar no WhatsApp." },
                    { question: "Atendem crianças?", answer: "Sim, temos psicólogos especializados em ludoterapia." }
                ];
                onEditAction('init-faq__', JSON.stringify(defaultFaq));
            }
        }
    }, [isEditorMode]);

    return (
        <div className="clinic-wrapper">

            {/* 1. NAVBAR */}
            <nav className="clinic-nav">
                <div className="clinic-container clinic-nav-inner">
                    <EditableText id="cl_logo" defaultText={d.name} className="clinic-logo" tagName="div" {...editProps} />

                    <div className="clinic-nav-links hidden md:flex">
                        <a href="#about" className="clinic-nav-link"><EditableText id="cl_nav_1" defaultText="A Clínica" tagName="span" {...editProps} /></a>
                        <a href="#team" className="clinic-nav-link"><EditableText id="cl_nav_2" defaultText="Equipe" tagName="span" {...editProps} /></a>
                        <a href="#services" className="clinic-nav-link"><EditableText id="cl_nav_3" defaultText="Especialidades" tagName="span" {...editProps} /></a>
                        <a href="#contact" className="clinic-nav-link"><EditableText id="cl_nav_4" defaultText="Contato" tagName="span" {...editProps} /></a>
                        <div className="flex items-center gap-4 ml-2 border-l border-gray-200 pl-4 h-6">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsClientDashboardOpen(true)}
                                        className="flex items-center gap-1 text-sm font-medium text-[var(--clinic-primary)] hover:opacity-80"
                                    >
                                        <CalendarCheck size={14} />
                                        <EditableText id="cl_nav_dash" defaultText="Minha Área" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-[var(--clinic-text)] hover:text-[var(--clinic-primary)]">
                                        <EditableText id="cl_nav_login" defaultText="Entrar" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-[var(--clinic-text)] hover:text-[var(--clinic-primary)]">
                                        <EditableText id="cl_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} />
                                    </button>
                                </>
                            )}
                        </div>
                        <button onClick={onBook} className="clinic-btn clinic-btn-primary ml-2">
                            <EditableText id="cl_nav_cta" defaultText="Agendar Consulta" tagName="span" {...editProps} />
                        </button>
                    </div>

                    <button className="md:hidden text-[var(--clinic-heading)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b shadow-xl p-4 flex flex-col gap-4">
                        <a href="#about" onClick={() => setMobileMenuOpen(false)}><EditableText id="cl_mob_1" defaultText="A Clínica" tagName="span" {...editProps} /></a>
                        <a href="#team" onClick={() => setMobileMenuOpen(false)}><EditableText id="cl_mob_2" defaultText="Equipe" tagName="span" {...editProps} /></a>
                        <button onClick={onBook} className="clinic-btn clinic-btn-primary w-full"><EditableText id="cl_mob_cta" defaultText="Agendar" tagName="span" {...editProps} /></button>
                    </div>
                )}
            </nav>

            {/* 2. HERO SECTION */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="clinic-hero">
                    <div className="clinic-container clinic-hero-grid">
                        <div>
                            <EditableText id="cl_hero_sub" defaultText="Cuidado Integral & Humanizado" className="clinic-subtitle" tagName="span" {...editProps} />
                            <EditableText id="cl_hero_title" defaultText={d.heroTitle} className="clinic-heading text-5xl md:text-6xl mb-6 leading-tight" tagName="h1" {...editProps} />
                            <EditableText id="cl_hero_desc" defaultText={d.heroSubtitle} className="text-lg text-[var(--clinic-text)] mb-8 leading-relaxed max-w-lg" tagName="p" {...editProps} />

                            <div className="flex gap-4 flex-wrap">
                                <button onClick={onBook} className="clinic-btn clinic-btn-primary">
                                    <EditableText id="cl_hero_cta1" defaultText="Agendar agora" tagName="span" {...editProps} /> <ArrowRight size={18} />
                                </button>
                                <a href="#about" className="clinic-btn clinic-btn-outline"><EditableText id="cl_hero_cta2" defaultText="Conheça a clínica" tagName="span" {...editProps} /></a>
                            </div>
                        </div>
                        <div className="clinic-hero-img-box group">
                            <EditableImage
                                editKey="coverImage"
                                currentSrc={heroImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="clinic-hero-img"
                                label="Alterar Capa"
                                alt="Clinic Hero"
                            />
                        </div>
                    </div>
                </header>
            )}

            {/* 3. IDENTIFICATION (PROBLEM) */}
            {customization?.visibleSections?.['highlights'] !== false && (
                <section className="clinic-ident">
                    <div className="clinic-container">
                        <div className="text-center max-w-2xl mx-auto">
                            <EditableText id="cl_id_sub" defaultText={d.identSub} className="clinic-subtitle" tagName="span" {...editProps} />
                            <EditableText id="cl_id_title" defaultText={d.identTitle} className="clinic-heading text-3xl mb-12" tagName="h2" {...editProps} />
                        </div>
                        <div className="clinic-ident-list">
                            {problems.map((p, i) => (
                                <div key={i} className="clinic-card flex items-start gap-4">
                                    <div className="p-2 bg-[var(--clinic-bg)] rounded-full text-[var(--clinic-primary)]">
                                        <EditableIcon id={`cl_prob_icon_${i}`} defaultIcon="Frown" size={24} {...editProps} />
                                    </div>
                                    <div>
                                        <EditableText id={`cl_prob_t_${i}`} defaultText={p} className="font-bold text-lg mb-2 block" tagName="h3" {...editProps} />
                                        <EditableText id={`cl_prob_d_${i}`} defaultText="Se isso tem afetado seu dia a dia, saiba que existe tratamento eficaz." className="text-sm text-gray-500" tagName="p" {...editProps} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. ABOUT CLINIC */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="clinic-about">
                    <div className="clinic-container grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative group rounded-lg overflow-hidden h-[500px]">
                            <EditableImage
                                editKey="aboutImage"
                                currentSrc={aboutImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover"
                                label="Foto Institucional"
                                alt="About"
                            />
                        </div>
                        <div>
                            <EditableText id="cl_about_sub" defaultText="Quem Somos" className="clinic-subtitle" tagName="span" {...editProps} />
                            <EditableText id="cl_about_title" defaultText={d.aboutTitle} className="clinic-heading text-4xl mb-6" tagName="h2" {...editProps} />
                            <EditableText id="cl_about_txt" defaultText={d.aboutText} className="text-lg leading-relaxed mb-8" tagName="div" {...editProps} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="clinic-stat">
                                    <h4 className="text-3xl font-bold text-[var(--clinic-primary)]"><EditableText id="cl_stat_1_num" defaultText="15+" tagName="span" {...editProps} /></h4>
                                    <p className="text-sm"><EditableText id="cl_stat_1_txt" defaultText="Especialistas" tagName="span" {...editProps} /></p>
                                </div>
                                <div className="clinic-stat">
                                    <h4 className="text-3xl font-bold text-[var(--clinic-primary)]"><EditableText id="cl_stat_2_num" defaultText="2k+" tagName="span" {...editProps} /></h4>
                                    <p className="text-sm"><EditableText id="cl_stat_2_txt" defaultText="Pacientes" tagName="span" {...editProps} /></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. TEAM */}
            {customization?.visibleSections?.['team'] !== false && (
                <section id="team" className="clinic-team">
                    <div className="clinic-container">
                        <div className="text-center mb-12">
                            <EditableText id="cl_team_sub" defaultText={d.teamSub} className="clinic-subtitle" tagName="span" {...editProps} />
                            <EditableText id="cl_team_title" defaultText={d.teamTitle} className="clinic-heading text-3xl" tagName="h2" {...editProps} />
                        </div>
                        <div className="clinic-team-grid">
                            {(customization?.team && customization.team.length > 0 ? customization.team :
                                // Fallback/Default Team
                                [
                                    { id: '1', name: 'Dr. João Silva', role: 'Psicólogo Clínico' },
                                    { id: '2', name: 'Dra. Maria Santos', role: 'Psiquiatra' },
                                    { id: '3', name: 'Dr. Pedro Costa', role: 'Terapeuta Ocupacional' },
                                    { id: '4', name: 'Dra. Ana Lima', role: 'Psicóloga Infantil' }
                                ]
                            ).map((member, i) => (
                                <div key={member.id || i} className="clinic-member-card group">
                                    <div className="relative overflow-hidden rounded-lg mb-4 aspect-[3/4] bg-gray-100">
                                        <EditableImage
                                            editKey={`teamImages__${i}`}
                                            currentSrc={customization?.teamImages?.[i] || ''}
                                            isEditorMode={isEditorMode}
                                            onEditAction={onEditAction}
                                            className="w-full h-full object-cover"
                                            label="Foto"
                                            alt={member.name}
                                        />
                                    </div>
                                    <EditableText
                                        id={`cl_tm_name_${i}`}
                                        defaultText={member.name}
                                        className="font-bold text-xl block"
                                        tagName="h3"
                                        {...editProps}
                                    />
                                    <EditableText
                                        id={`cl_tm_role_${i}`}
                                        defaultText={member.role}
                                        className="text-sm text-[var(--clinic-primary)] block"
                                        tagName="span"
                                        {...editProps}
                                    />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('team-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-red-100 p-2 rounded-full text-red-600 hover:bg-red-200 transition-colors z-20"
                                            title="Remover Profissional"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditorMode && (
                                <button
                                    onClick={() => onEditAction?.('team-add')}
                                    className="clinic-member-card group border-2 border-dashed border-gray-300 hover:border-[var(--clinic-primary)] bg-gray-50 hover:bg-white flex flex-col items-center justify-center cursor-pointer min-h-[300px] transition-all"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gray-200 group-hover:bg-[var(--clinic-primary)] group-hover:text-white flex items-center justify-center mb-4 transition-colors text-gray-400">
                                        <Plus size={32} />
                                    </div>
                                    <span className="font-bold text-gray-500 group-hover:text-[var(--clinic-primary)] text-lg">Adicionar Profissional</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. SERVICES */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="clinic-services">
                    <div className="clinic-container">
                        <EditableText id="cl_serv_title" defaultText={d.servTitle} className="font-serif text-3xl text-white mb-12 text-center" tagName="h2" {...editProps} />
                        <div className="clinic-services-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList :
                                // Fallback Services
                                [
                                    { id: '1', title: 'Psicoterapia Individual', description: 'Atendimento focado nas necessidades individuais.' },
                                    { id: '2', title: 'Terapia de Casal', description: 'Resolução de conflitos e melhoria da comunicação.' },
                                    { id: '3', title: 'Terapia Familiar', description: 'Apoio para dinâmicas familiares complexas.' },
                                    { id: '4', title: 'Plantão Psicológico', description: 'Acolhimento imediato em crises.' },
                                    { id: '5', title: 'Avaliação Neuro', description: 'Diagnóstico detalhado de funções cognitivas.' },
                                    { id: '6', title: 'Grupos Terapêuticos', description: 'Troca de experiências mediada por profissional.' }
                                ]
                            ).map((service, i) => (
                                <div key={service.id || i} className="clinic-service-card">
                                    <div className="mb-4 text-[var(--clinic-accent)]">
                                        <EditableIcon id={`cl_svc_icon_${service.id || i}`} defaultIcon="Brain" size={32} {...editProps} />
                                    </div>
                                    <EditableText
                                        id={`cl_svc_title_${i}`}
                                        defaultText={service.title}
                                        className="font-bold text-xl text-white mb-2 block"
                                        tagName="h3"
                                        {...editProps}
                                    />
                                    <EditableText
                                        id={`cl_svc_desc_${i}`}
                                        defaultText={service.description}
                                        className="text-sm text-white/70"
                                        tagName="p"
                                        {...editProps}
                                    />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-white/20 p-2 rounded-full text-white hover:bg-red-500 transition-colors z-20"
                                            title="Remover Serviço"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isEditorMode && (
                            <button
                                onClick={() => onEditAction?.('service-add')}
                                className="clinic-service-card border-2 border-dashed border-white/20 hover:bg-white/10 flex flex-col items-center justify-center cursor-pointer min-h-[250px] transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center mb-4 text-white">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-white text-lg">Adicionar Especialidade</span>
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* 7. SPACE (GALLERY) */}
            {customization?.visibleSections?.['gallery'] !== false && (
                <section className="clinic-gallery">
                    <div className="clinic-container">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <EditableText id="cl_gal_sub" defaultText="Ambiente Acolhedor" className="clinic-subtitle" tagName="span" {...editProps} />
                                <EditableText id="cl_gal_title" defaultText={d.spaceTitle} className="clinic-heading text-3xl" tagName="h2" {...editProps} />
                            </div>
                            <div className="relative group">
                                {/* Overlay removed as EditableImage handles it */}
                            </div>
                        </div>

                        <div className="clinic-gallery-grid">
                            {/* Gallery Items */}
                            {(isEditorMode ? (gallery.length > 0 ? gallery : []) : gallery.filter(Boolean)).map((img, idx) => (
                                <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                    <EditableImage
                                        editKey={`galleryImages__${idx}`}
                                        currentSrc={img}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover clinic-gallery-item"
                                        label={`Galeria ${idx + 1}`}
                                        alt={`Space ${idx}`}
                                    />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('gallery-remove__' + idx); }}
                                            className="absolute top-2 right-2 bg-red-100 p-2 rounded-full text-red-600 hover:bg-red-200 transition-colors z-20"
                                            title="Remover Imagem"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add Button (Editor Only) */}
                            {isEditorMode && (
                                <button
                                    onClick={() => onEditAction?.('gallery-add')}
                                    className="relative aspect-square rounded-lg border-2 border-dashed border-green-500 bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-2">
                                        <Plus className="text-green-600" size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-green-700">Adicionar</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. TESTIMONIALS */}
            {customization?.visibleSections?.['testimonials'] !== false && (
                <section className="clinic-reviews">
                    <div className="clinic-container">
                        <EditableText id="cl_test_title" defaultText={d.testTitle} className="clinic-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div className="grid md:grid-cols-3 gap-8">
                            {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials :
                                // Fallback Testimonials
                                [
                                    { id: '1', text: 'Melhor decisão que tomei. Profissionais excelentes.', author: 'Ana Silva', role: 'Paciente', rating: 5 },
                                    { id: '2', text: 'Ambiente acolhedor e seguro. Recomendo muito.', author: 'Carlos Mendes', role: 'Paciente', rating: 5 },
                                    { id: '3', text: 'Me ajudou a superar momentos difíceis com muita empatia.', author: 'Juliana Costa', role: 'Paciente', rating: 5 }
                                ]
                            ).map((testim, i) => (
                                <div key={testim.id || i} className="clinic-card relative group">
                                    <div className="flex gap-1 text-[var(--clinic-accent)] mb-4" title={isEditorMode ? "Alterar avaliação" : ""}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                                key={s}
                                                size={16}
                                                className={`cursor-pointer ${s <= (testim.rating || 5) ? 'fill-[var(--clinic-accent)]' : 'text-gray-300'}`}
                                                fill={s <= (testim.rating || 5) ? "currentColor" : "none"}
                                                onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-gray-600 italic mb-6 block flex gap-1">
                                        "
                                        <EditableText
                                            id={`cl_test_text_${i}`}
                                            defaultText={testim.text}
                                            tagName="span"
                                            {...editProps}
                                        />
                                        "
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 relative shrink-0">
                                            <EditableImage
                                                editKey={`testimonialImages__${i}`}
                                                currentSrc={customization?.testimonialImages?.[i]}
                                                isEditorMode={isEditorMode}
                                                onEditAction={onEditAction}
                                                className="w-full h-full object-cover"
                                                alt={testim.author}
                                                renderPlaceholder={() => (
                                                    <div className="w-full h-full bg-[var(--clinic-primary)] text-white flex items-center justify-center font-bold">
                                                        {testim.author.charAt(0)}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <EditableText
                                                id={`cl_test_author_${i}`}
                                                defaultText={testim.author}
                                                className="font-bold text-sm block text-gray-900"
                                                tagName="span"
                                                {...editProps}
                                            />
                                            {testim.role && (
                                                <EditableText
                                                    id={`cl_test_role_${i}`}
                                                    defaultText={testim.role}
                                                    className="text-xs text-gray-500"
                                                    tagName="span"
                                                    {...editProps}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('testimonial-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-red-100 p-2 rounded-full text-red-600 hover:bg-red-200 transition-colors z-20 opacity-0 group-hover:opacity-100"
                                            title="Remover Depoimento"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isEditorMode && (
                            <button
                                onClick={() => onEditAction?.('testimonial-add')}
                                className="w-full mt-8 py-8 border-2 border-dashed border-[var(--clinic-primary)]/30 hover:bg-[var(--clinic-primary)]/5 flex flex-col items-center justify-center cursor-pointer transition-colors group rounded-xl"
                            >
                                <div className="w-12 h-12 rounded-full bg-[var(--clinic-primary)]/10 group-hover:bg-[var(--clinic-primary)]/20 flex items-center justify-center mb-4 text-[var(--clinic-primary)]">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-[var(--clinic-primary)] text-lg">Adicionar Depoimento</span>
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* 9. FAQ */}
            {customization?.visibleSections?.['faq'] !== false && (
                <section className="clinic-faq">
                    <div className="clinic-container max-w-3xl">
                        <EditableText id="cl_faq_title" defaultText={d.faqTitle} className="clinic-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div>
                            {(customization?.faq && customization.faq.length > 0 ? customization.faq :
                                // Fallback FAQ
                                [
                                    { id: '1', question: "Quais convênios vocês aceitam?", answer: "Trabalhamos com sistema de reembolso para a maioria dos planos." },
                                    { id: '2', question: "Como agendar uma avaliação?", answer: "Você pode agendar diretamente pelo site ou nos chamar no WhatsApp." },
                                    { id: '3', question: "Atendem crianças?", answer: "Sim, temos psicólogos especializados em ludoterapia." }
                                ]
                            ).map((f, i) => (
                                <div key={f.id || i} className="clinic-faq-item">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFaq(i)}>
                                        <EditableText
                                            id={`cl_faq_q_${i}`}
                                            defaultText={f.question}
                                            className="font-bold text-lg"
                                            tagName="span"
                                            {...editProps}
                                        />
                                        <ChevronDown className={`transition - transform ${openFaq === i ? 'rotate-180' : ''} `} />
                                    </div>
                                    {openFaq === i && (
                                        <div className="mt-4 text-gray-600">
                                            <EditableText
                                                id={`cl_faq_a_${i}`}
                                                defaultText={f.answer}
                                                tagName="p"
                                                {...editProps}
                                            />
                                        </div>
                                    )}
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('faq-remove__' + i); }}
                                            className="absolute top-4 right-12 text-red-400 hover:text-red-600 transition-colors z-20"
                                            title="Remover Pergunta"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isEditorMode && (
                            <button
                                onClick={() => onEditAction?.('faq-add')}
                                className="w-full py-4 border-2 border-dashed border-green-500 bg-green-50 hover:bg-green-100 flex items-center justify-center gap-2 rounded-lg transition-colors group mt-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center">
                                    <Plus className="text-green-600" size={20} />
                                </div>
                                <span className="font-bold text-green-700">Adicionar Pergunta</span>
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* 10. CONTACT / FOOTER */}
            {customization?.visibleSections?.['contact'] !== false && (
                <footer className="clinic-contact" id="contact">
                    <div className="clinic-container">
                        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl p-8 md:p-12 shadow-xl">
                            <div>
                                <EditableText id="cl_ct_title" defaultText={d.contactTitle} className="clinic-heading text-3xl mb-6" tagName="h2" {...editProps} />
                                <p className="text-gray-600 mb-8"><EditableText id="cl_ct_intro" defaultText="Estamos prontos para te ouvir. Entre em contato pelos canais abaixo ou agende online." tagName="span" {...editProps} /></p>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--clinic-secondary)] rounded-full flex items-center justify-center text-[var(--clinic-primary)]">
                                            <Phone />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase text-gray-400"><EditableText id="cl_ct_lbl_phone" defaultText="Telefone" tagName="span" {...editProps} /></p>
                                            <EditableText id="cl_ct_phone" defaultText="(11) 99999-9999" className="font-bold text-lg" tagName="p" {...editProps} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--clinic-secondary)] rounded-full flex items-center justify-center text-[var(--clinic-primary)]">
                                            <Mail />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase text-gray-400"><EditableText id="cl_ct_lbl_email" defaultText="Email" tagName="span" {...editProps} /></p>
                                            <EditableText id="cl_ct_email" defaultText="contato@clinica.com" className="font-bold text-lg" tagName="p" {...editProps} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--clinic-secondary)] rounded-full flex items-center justify-center text-[var(--clinic-primary)]">
                                            <MapPin />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase text-gray-400"><EditableText id="cl_ct_lbl_addr" defaultText="Localização" tagName="span" {...editProps} /></p>
                                            <EditableText id="cl_ct_addr" defaultText="Av. Paulista, 1000 - São Paulo" className="font-bold text-lg" tagName="p" {...editProps} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[var(--clinic-bg)] p-8 rounded-xl flex flex-col justify-center text-center">
                                <h3 className="text-xl font-bold mb-4"><EditableText id="cl_ct_box_title" defaultText="Agende sua primeira consulta" tagName="span" {...editProps} /></h3>
                                <p className="text-gray-500 mb-8"><EditableText id="cl_ct_box_txt" defaultText="Verifique nossa disponibilidade e escolha o melhor horário para você." tagName="span" {...editProps} /></p>
                                <button onClick={onBook} className="clinic-btn clinic-btn-primary w-full shadow-lg">
                                    <EditableText id="cl_ct_box_btn" defaultText="Ver Horários Disponíveis" tagName="span" {...editProps} />
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            <div className="clinic-footer">
                <div className="clinic-container flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="flex flex-col items-start gap-2">
                        <p>&copy; {new Date().getFullYear()} {d.name}. <EditableText id="cl_footer_copy" defaultText="Todos os direitos reservados." tagName="span" {...editProps} /></p>
                        <StoreFooterRating
                            storeId={store?.id || 'demo'}
                            rating={store?.rating}
                            totalReviews={store?.totalReviews}
                            color="#3b82f6"
                            isEditorMode={isEditorMode}
                            textColor="white" // clinic footer is likely dark
                        />
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white"><EditableText id="cl_footer_link1" defaultText="Política de Privacidade" tagName="span" {...editProps} /></a>
                        <a href="#" className="hover:text-white"><EditableText id="cl_footer_link2" defaultText="Termos de Uso" tagName="span" {...editProps} /></a>
                    </div>
                </div>
            </div>

            {/* Patient Auth Modal */}
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

        </div>
    );
};

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Zap, Activity, Shield, Users, ArrowRight,
    Check, Play, Star, ChevronDown, Leaf, Plus, Trash2, User as UserIcon, LogOut, CalendarCheck
} from 'lucide-react';
import { EditOverlay } from '../../components/EditOverlay';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import './LandingPageVitality.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageVitality = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

    const d = {
        name: store?.name || "Vitality Clinic",

        // 1. Hero
        heroTitle: customization?.welcomeTitle || "Sua saúde mental em primeiro lugar",
        heroSub: customization?.welcomeMessage || "Uma abordagem moderna e integrativa para você viver com mais energia e equilíbrio.",

        // 2. Highlights

        // 3. About
        abtTitle: "Quem somos nós",

        // 4. Stats

        // 5. Services
        srvTitle: "Nossas Especialidades",

        // 6. Journey
        jrnTitle: "Sua Jornada",

        // 7. Feature
        ftTitle: "Terapia Online",

        // 8. Testimonials
        tstTitle: "O que dizem",

        // 9. FAQ
        faqTitle: "Dúvidas Frequentes",

        // 10. Contact
        ctaTitle: "Comece sua mudança hoje",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;
    const featureImage = customization?.galleryImages?.[0];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Auto-populate defaults in Editor Mode if empty
        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                const defaultServices = [
                    { title: 'Psicoterapia', description: 'Acompanhamento individual para questões emocionais.' },
                    { title: 'Terapia de Casal', description: 'Resolução de conflitos e reconexão.' },
                    { title: 'Ansiedade e Estresse', description: 'Estratégias para viver com mais equilíbrio.' },
                    { title: 'Depressão', description: 'Acolhimento e tratamento especializado.' },
                    { title: 'Desenvolvimento Pessoal', description: 'Autoconhecimento e crescimento.' },
                    { title: 'Orientação Profissional', description: 'Planejamento e redirecionamento de carreira.' }
                ];
                onEditAction('init-services__', JSON.stringify(defaultServices));
            }
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                const defaultTestimonials = {
                    testimonials: [
                        { text: 'Profissionais excelentes e ambiente muito acolhedor. Recomendo fortemente.', author: 'Paciente Satisfeito', rating: 5 },
                        { text: 'Me ajudou a ver a vida de outra forma.', author: 'Maria C.', rating: 5 },
                        { text: 'Terapia transformadora.', author: 'João P.', rating: 5 }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-testimonials__', JSON.stringify(defaultTestimonials));
            }
            if (!customization?.faq || customization.faq.length === 0) {
                const defaultFaq = [
                    { question: "Aceitam convênio?", answer: "Trabalhamos com sistema de reembolso e nota fiscal para todos os planos." },
                    { question: "Como funciona a terapia online?", answer: "Sessões por vídeo chamada com a mesma qualidade do presencial." },
                    { question: "Qual a duração das sessões?", answer: "As sessões têm duração média de 50 minutos." }
                ];
                onEditAction('init-faq__', JSON.stringify(defaultFaq));
            }
        }
    }, [isEditorMode]);

    return (
        <div className="vit-wrapper">


            {/* 1. NAVBAR */}
            <nav className="vit-nav">
                <div className="vit-container vit-nav-inner">
                    <div className="vit-logo">
                        <Leaf className="text-[var(--vit-primary)]" />
                        <EditableText id="vt_logo" defaultText={d.name} tagName="span" {...editProps} />
                    </div>

                    <div className="vit-nav-links hidden md:flex">
                        <a href="#about" className="vit-nav-link"><EditableText id="vt_nav_1" defaultText="Sobre" tagName="span" {...editProps} /></a>
                        <a href="#services" className="vit-nav-link"><EditableText id="vt_nav_2" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <a href="#journey" className="vit-nav-link"><EditableText id="vt_nav_3" defaultText="Jornada" tagName="span" {...editProps} /></a>
                        <a href="#faq" className="vit-nav-link"><EditableText id="vt_nav_4" defaultText="FAQ" tagName="span" {...editProps} /></a>
                        <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-200">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsClientDashboardOpen(true)}
                                        className="flex items-center gap-1 text-sm font-medium text-[var(--vit-primary)] hover:opacity-80"
                                    >
                                        <CalendarCheck size={14} />
                                        <EditableText id="vt_nav_dash" defaultText="Minha Área" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-600 hover:text-[var(--vit-primary)]">
                                        <EditableText id="vt_nav_login" defaultText="Entrar" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-600 hover:text-[var(--vit-primary)]">
                                        <EditableText id="vt_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} />
                                    </button>
                                </>
                            )}
                        </div>
                        <button onClick={onBook} className="vit-btn vit-btn-primary ml-2">
                            <EditableText id="vt_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
                        </button>
                    </div>

                    <button className="md:hidden text-[var(--vit-dark)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b p-4 flex flex-col gap-4 shadow-xl">
                        <a href="#services" onClick={() => setMobileMenuOpen(false)}><EditableText id="vt_mob_1" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <a href="#journey" onClick={() => setMobileMenuOpen(false)}><EditableText id="vt_mob_2" defaultText="Jornada" tagName="span" {...editProps} /></a>
                        <button onClick={onBook} className="vit-btn vit-btn-primary w-full"><EditableText id="vt_mob_cta" defaultText="Agendar" tagName="span" {...editProps} /></button>
                    </div>
                )}
            </nav>

            {/* 1. HERO */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="vit-hero">
                    <div className="vit-container vit-hero-grid">
                        <div>
                            <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-[var(--vit-dark)] text-sm font-bold mb-6">
                                <EditableText id="vt_hero_badge" defaultText="Novos horários disponíveis" tagName="span" {...editProps} />
                            </div>
                            <EditableText id="vt_hero_title" defaultText={d.heroTitle} className="vit-heading text-5xl md:text-6xl mb-6" tagName="h1" {...editProps} />
                            <EditableText id="vt_hero_sub" defaultText={d.heroSub} className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed" tagName="p" {...editProps} />
                            <div className="flex gap-4">
                                <button onClick={onBook} className="vit-btn vit-btn-primary">
                                    <EditableText id="vt_hero_cta1" defaultText="Agendar Sessão" tagName="span" {...editProps} />
                                </button>
                                <a href="#about" className="vit-btn vit-btn-outline">
                                    <EditableText id="vt_hero_cta2" defaultText="Saiba Mais" tagName="span" {...editProps} />
                                </a>
                            </div>
                        </div>
                        <div className="vit-hero-img-box group">
                            <EditableImage
                                editKey="coverImage"
                                currentSrc={heroImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="vit-hero-img"
                                label="Capa Principal"
                                alt="Hero"
                            />
                        </div>
                    </div>
                </header>
            )}

            {/* 2. HIGHLIGHTS (VALUE PROPS) */}
            {customization?.visibleSections?.['highlights'] !== false && (
                <section className="vit-highlights">
                    <div className="vit-container">
                        <div className="vit-highlights-grid">
                            <div className="vit-card bg-emerald-50 border-emerald-100">
                                <Zap className="text-[var(--vit-primary)] mb-4" />
                                <EditableText id="vt_hl_t1" defaultText="Abordagem Ágil" className="font-bold text-lg mb-2 block" tagName="h3" {...editProps} />
                                <EditableText id="vt_hl_d1" defaultText="Foco em resultados práticos para o seu dia a dia." className="text-sm text-gray-600" tagName="div" {...editProps} />
                            </div>
                            <div className="vit-card bg-teal-50 border-teal-100">
                                <Shield className="text-teal-600 mb-4" />
                                <EditableText id="vt_hl_t2" defaultText="Ambiente Seguro" className="font-bold text-lg mb-2 block" tagName="h3" {...editProps} />
                                <EditableText id="vt_hl_d2" defaultText="Total confidencialidade e acolhimento." className="text-sm text-gray-600" tagName="div" {...editProps} />
                            </div>
                            <div className="vit-card bg-lime-50 border-lime-100">
                                <Activity className="text-[var(--vit-accent)] mb-4" />
                                <EditableText id="vt_hl_t3" defaultText="Saúde Integral" className="font-bold text-lg mb-2 block" tagName="h3" {...editProps} />
                                <EditableText id="vt_hl_d3" defaultText="Cuidando da mente com reflexos no corpo." className="text-sm text-gray-600" tagName="div" {...editProps} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. ABOUT */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="vit-about">
                    <div className="vit-container vit-about-container">
                        <div className="relative group">
                            <EditableImage
                                editKey="aboutImage"
                                currentSrc={aboutImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="vit-about-img object-cover opacity-90"
                                label="Foto Sobre"
                                alt="About"
                            />
                        </div>
                        <div>
                            <h4 className="text-[var(--vit-primary)] font-bold uppercase tracking-wider text-sm mb-2"><EditableText id="vt_abt_label" defaultText="Conheça a clínica" tagName="span" {...editProps} /></h4>
                            <EditableText id="vt_abt_title" defaultText={d.abtTitle} className="vit-heading text-4xl mb-6" tagName="h2" {...editProps} />
                            <EditableText id="vt_abt_txt" defaultText="Nossa missão é democratizar o acesso a terapias integrativas de alta qualidade. Contamos com um time multidisciplinar apaixonado pelo que faz." className="text-lg text-gray-600 mb-8 leading-relaxed" tagName="p" {...editProps} />

                            <ul className="space-y-4">
                                <li className="flex gap-3 items-center font-medium">
                                    <span className="p-1 rounded-full bg-green-100 text-green-600"><Check size={16} /></span>
                                    <EditableText id="vt_abt_l1" defaultText="Profissionais certificados" tagName="span" {...editProps} />
                                </li>
                                <li className="flex gap-3 items-center font-medium">
                                    <span className="p-1 rounded-full bg-green-100 text-green-600"><Check size={16} /></span>
                                    <EditableText id="vt_abt_l2" defaultText="Metodologia baseada em evidências" tagName="span" {...editProps} />
                                </li>
                                <li className="flex gap-3 items-center font-medium">
                                    <span className="p-1 rounded-full bg-green-100 text-green-600"><Check size={16} /></span>
                                    <EditableText id="vt_abt_l3" defaultText="Atendimento humanizado" tagName="span" {...editProps} />
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            )}

            {/* 4. TRUST (STATS) */}
            {customization?.visibleSections?.['stats'] !== false && (
                <section className="vit-trust">
                    <div className="vit-container">
                        <div className="vit-stats-grid">
                            <div>
                                <h4 className="text-4xl font-bold mb-2"><EditableText id="vt_stat_1_num" defaultText="5+" tagName="span" {...editProps} /></h4>
                                <p className="text-emerald-200 text-sm uppercase"><EditableText id="vt_stat_1_lbl" defaultText="Anos" tagName="span" {...editProps} /></p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-bold mb-2"><EditableText id="vt_stat_2_num" defaultText="2k+" tagName="span" {...editProps} /></h4>
                                <p className="text-emerald-200 text-sm uppercase"><EditableText id="vt_stat_2_lbl" defaultText="Pacientes" tagName="span" {...editProps} /></p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-bold mb-2"><EditableText id="vt_stat_3_num" defaultText="15" tagName="span" {...editProps} /></h4>
                                <p className="text-emerald-200 text-sm uppercase"><EditableText id="vt_stat_3_lbl" defaultText="Especialistas" tagName="span" {...editProps} /></p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-bold mb-2"><EditableText id="vt_stat_4_num" defaultText="4.9" tagName="span" {...editProps} /></h4>
                                <p className="text-emerald-200 text-sm uppercase"><EditableText id="vt_stat_4_lbl" defaultText="Avaliação" tagName="span" {...editProps} /></p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. SERVICES */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="vit-services">
                    <div className="vit-container">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <EditableText id="vt_srv_title" defaultText={d.srvTitle} className="vit-heading text-3xl mb-4" tagName="h2" {...editProps} />
                            <p className="text-gray-500"><EditableText id="vt_srv_sub" defaultText="Soluções personalizadas para cada etapa da sua vida." tagName="span" {...editProps} /></p>
                        </div>
                        <div className="vit-services-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : [
                                { title: 'Psicoterapia', description: 'Acompanhamento individual para questões emocionais.' },
                                { title: 'Terapia de Casal', description: 'Resolução de conflitos e reconexão.' },
                                { title: 'Ansiedade e Estresse', description: 'Estratégias para viver com mais equilíbrio.' },
                                { title: 'Depressão', description: 'Acolhimento e tratamento especializado.' },
                                { title: 'Desenvolvimento Pessoal', description: 'Autoconhecimento e crescimento.' },
                                { title: 'Orientação Profissional', description: 'Planejamento e redirecionamento de carreira.' }
                            ]).map((service: any, i: number) => (
                                <div key={i} className="vit-card group relative">
                                    <div className="mb-4 text-[var(--vit-primary)] transition-transform group-hover:scale-110 origin-left">
                                        <EditableIcon id={`vt_srv_i${i}`} defaultIcon="Zap" size={32} {...editProps} />
                                    </div>
                                    <EditableText id={`vt_srv_t${i}`} defaultText={service.title} className="font-bold text-xl mb-2 block" tagName="h3" {...editProps} />
                                    <EditableText id={`vt_srv_d${i}`} defaultText={service.description} className="text-sm text-gray-500 mb-4 block" tagName="p" {...editProps} />
                                    <a href="#" onClick={(e) => { e.preventDefault(); onBook?.(); }} className="text-sm font-bold text-[var(--vit-primary)] hover:underline flex items-center gap-1">
                                        Agendar <ArrowRight size={14} />
                                    </a>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    className="vit-card border-2 border-dashed border-green-500 bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-4">
                                        <Plus className="text-green-600" size={24} />
                                    </div>
                                    <span className="font-bold text-green-700 text-lg">Adicionar Especialidade</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. JOURNEY */}
            {customization?.visibleSections?.['journey'] !== false && (
                <section id="journey" className="vit-journey">
                    <div className="vit-container">
                        <EditableText id="vt_jrn_title" defaultText={d.jrnTitle} className="vit-heading text-3xl mb-12 text-center" tagName="h2" {...editProps} />
                        <div className="vit-journey-steps">
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 rounded-full bg-[var(--vit-primary)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">1</div>
                                <h3 className="font-bold text-xl mb-2"><EditableText id="vt_jrn_t1" defaultText="Contato" tagName="span" {...editProps} /></h3>
                                <p className="text-sm text-gray-500 px-4"><EditableText id="vt_jrn_d1" defaultText="Entre em contato e tire suas dúvidas iniciais." tagName="span" {...editProps} /></p>
                            </div>
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 rounded-full bg-[var(--vit-primary)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">2</div>
                                <h3 className="font-bold text-xl mb-2"><EditableText id="vt_jrn_t2" defaultText="Avaliação" tagName="span" {...editProps} /></h3>
                                <p className="text-sm text-gray-500 px-4"><EditableText id="vt_jrn_d2" defaultText="Uma conversa inicial para entender suas necessidades." tagName="span" {...editProps} /></p>
                            </div>
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 rounded-full bg-[var(--vit-primary)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">3</div>
                                <h3 className="font-bold text-xl mb-2"><EditableText id="vt_jrn_t3" defaultText="Início" tagName="span" {...editProps} /></h3>
                                <p className="text-sm text-gray-500 px-4"><EditableText id="vt_jrn_d3" defaultText="Começamos o tratamento focado nos seus objetivos." tagName="span" {...editProps} /></p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 7. DEEP DIVE FEATURE */}
            {customization?.visibleSections?.['expertise'] !== false && (
                <section className="vit-feature">
                    <div className="vit-container vit-feature-grid">
                        <div>
                            <h4 className="text-[var(--vit-primary)] font-bold uppercase tracking-wider text-sm mb-2"><EditableText id="vt_ft_label" defaultText="Destaque" tagName="span" {...editProps} /></h4>
                            <EditableText id="vt_ft_title" defaultText={d.ftTitle} className="vit-heading text-4xl mb-6" tagName="h2" {...editProps} />
                            <EditableText id="vt_ft_txt" defaultText="Não deixe a distância ou a falta de tempo impedirem seu cuidado. Nossa plataforma de terapia online é segura, estável e permite que você faça suas sessões de onde estiver." className="text-lg text-gray-600 mb-8 leading-relaxed" tagName="p" {...editProps} />
                            <button onClick={onBook} className="vit-btn vit-btn-primary">
                                <EditableText id="vt_ft_cta" defaultText="Conhecer Plano Online" tagName="span" {...editProps} />
                            </button>
                        </div>
                        <div className="h-80 bg-gray-100 rounded-2xl relative overflow-hidden group">
                            <EditableImage
                                editKey="galleryImages__0"
                                currentSrc={featureImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover"
                                label="Imagem Destaque"
                                alt="Feature"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* 8. TESTIMONIALS */}
            {customization?.visibleSections?.['testimonials'] !== false && (
                <section className="vit-testimonials">
                    <div className="vit-container">
                        <EditableText id="vt_tst_title" defaultText={d.tstTitle} className="vit-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div className="grid md:grid-cols-3 gap-6">
                            {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : [
                                { text: 'Profissionais excelentes e ambiente muito acolhedor. Recomendo fortemente.', author: 'Paciente Satisfeito', rating: 5 },
                                { text: 'Me ajudou a ver a vida de outra forma.', author: 'Maria C.', rating: 5 },
                                { text: 'Terapia transformadora.', author: 'João P.', rating: 5 }
                            ]).map((testim: any, i: number) => (
                                <div key={i} className="vit-card relative group">
                                    <div className="flex gap-1 text-yellow-400 mb-4" title={isEditorMode ? "Alterar avaliação" : ""}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                                key={s}
                                                size={16}
                                                className={`cursor-pointer ${s <= (testim.rating || 5) ? 'fill-yellow-400' : 'text-gray-300'}`}
                                                fill={s <= (testim.rating || 5) ? "currentColor" : "none"}
                                                onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                            />
                                        ))}
                                    </div>
                                    <EditableText id={`vt_rev_t${i}`} defaultText={testim.text} className="italic text-gray-600 mb-4 block" tagName="p" {...editProps} />

                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative shrink-0">
                                            <EditableImage
                                                editKey={`testimonialImages__${i}`}
                                                currentSrc={customization?.testimonialImages?.[i]}
                                                isEditorMode={isEditorMode}
                                                onEditAction={onEditAction}
                                                className="w-full h-full object-cover"
                                                alt={testim.author}
                                            />
                                        </div>
                                        <div className="font-bold text-sm">
                                            <EditableText id={`vt_rev_a${i}`} defaultText={testim.author} tagName="span" {...editProps} />
                                        </div>
                                    </div>

                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('testimonial-remove__' + i); }}
                                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
                                    className="vit-card border-2 border-dashed border-green-500 bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-4">
                                        <Plus className="text-green-600" size={24} />
                                    </div>
                                    <span className="font-bold text-green-700 text-lg">Adicionar Depoimento</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 9. FAQ */}
            {customization?.visibleSections?.['faq'] !== false && (
                <section id="faq" className="vit-faq">
                    <div className="vit-container max-w-2xl">
                        <EditableText id="vt_faq_title" defaultText={d.faqTitle} className="vit-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div>
                            {(customization?.faq && customization.faq.length > 0 ? customization.faq : [
                                { question: "Aceitam convênio?", answer: "Trabalhamos com sistema de reembolso e nota fiscal para todos os planos." },
                                { question: "Como funciona a terapia online?", answer: "Sessões por vídeo chamada com a mesma qualidade do presencial." },
                                { question: "Qual a duração das sessões?", answer: "As sessões têm duração média de 50 minutos." }
                            ]).map((item: any, i: number) => (
                                <div key={i} className="vit-faq-item relative group">
                                    <div className="vit-faq-q" onClick={() => toggleFaq(i)}>
                                        <EditableText id={`vt_fq_q${i}`} defaultText={item.question} tagName="span" {...editProps} />
                                        <ChevronDown className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openFaq === i && (
                                        <div className="vit-faq-a">
                                            <EditableText id={`vt_fq_a${i}`} defaultText={item.answer} tagName="p" {...editProps} />
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
                                    className="w-full py-4 border-2 border-dashed border-green-500 bg-green-50 hover:bg-green-100 flex items-center justify-center gap-2 rounded-lg transition-colors group mt-4"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center">
                                        <Plus className="text-green-600" size={20} />
                                    </div>
                                    <span className="font-bold text-green-700">Adicionar Pergunta</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 10. CONTACT */}
            {customization?.visibleSections?.['contact'] !== false && (
                <section className="vit-contact">
                    <div className="vit-container">
                        <div className="max-w-3xl mx-auto">
                            <EditableText id="vt_cta_title" defaultText={d.ctaTitle} className="vit-heading text-white text-4xl md:text-5xl mb-8" tagName="h2" {...editProps} />
                            <p className="text-emerald-100 text-xl mb-10"><EditableText id="vt_cta_sub" defaultText="Dê o primeiro passo em direção ao seu bem-estar. Estamos aqui para te apoiar." tagName="span" {...editProps} /></p>
                            <button onClick={onBook} className="vit-btn bg-white text-[var(--vit-dark)] hover:bg-gray-100 px-8 py-4 text-lg">
                                <EditableText id="vt_cta_btn" defaultText="Agendar Agora" tagName="span" {...editProps} />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <footer className="vit-footer">
                <div className="vit-container flex flex-col items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} {d.name}. <EditableText id="vt_footer_txt" defaultText="Todos os direitos reservados." tagName="span" {...editProps} /></p>
                    <StoreFooterRating
                        storeId={store?.id || 'demo'}
                        rating={store?.rating}
                        totalReviews={store?.totalReviews}
                        color="#10b981"
                        isEditorMode={isEditorMode}
                        textColor="#064e3b"
                    />
                </div>
            </footer>

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

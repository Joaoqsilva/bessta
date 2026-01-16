import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Sun, Heart, Smile, ArrowRight, CheckCircle,
    MessageCircle, Calendar, Plus, Trash2, Star, User as UserIcon, LogOut, CalendarCheck
} from 'lucide-react';
import { EditOverlay } from '../../components/EditOverlay';
import { StarRating } from '../../components/StarRating';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { StandardFooter } from '../../components/StandardFooter';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import './LandingPageSunny.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageSunny = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

    const d = {
        name: store?.name || "Psicóloga Mariana Costa",

        // 1. Hero
        heroTitle: customization?.welcomeTitle || "Encontre seu equilíbrio emocional",
        heroSub: customization?.welcomeMessage || "Atendimento psicológico humanizado e acolhedor. Juntas, vamos cuidar da sua saúde mental.",

        // 2. Focus
        focTitle: "Como posso te ajudar?",

        // 3. About
        abtTitle: "Olá, sou a Mariana",

        // 4. Services
        srvTitle: "Meus Serviços",

        // 5. Method
        metTitle: "Minha Abordagem",

        // 6. Benefits
        benTitle: "Por que fazer terapia?",

        // 7. Testimonials
        tstTitle: "O que dizem sobre mim",

        // 8. FAQ
        faqTitle: "Dúvidas Frequentes",

        // 9. Contact
        ctaTitle: "Vamos começar sua jornada?",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

    const DEFAULT_SERVICES = [
        { title: "Terapia Individual", description: "Sessões personalizadas de 50 minutos para trabalhar suas questões emocionais." },
        { title: "Terapia de Casal", description: "Espaço seguro para melhorar a comunicação e fortalecer o relacionamento." },
        { title: "Orientação Parental", description: "Suporte especializado para os desafios da maternidade e paternidade." }
    ];

    const DEFAULT_TESTIMONIALS = {
        testimonials: [
            { text: '"A Mariana me ajudou a superar minha ansiedade de uma forma que nunca imaginei ser possível. Recomendo demais!"', author: "Carolina M.", role: "Paciente há 1 ano", rating: 5 },
            { text: '"Finalmente encontrei uma profissional que me escuta de verdade. As sessões são transformadoras."', author: "Rafael S.", role: "Paciente há 8 meses", rating: 5 },
            { text: '"Depois de anos tentando, foi com a Mariana que consegui entender e trabalhar minha autoestima."', author: "Juliana P.", role: "Paciente há 2 anos", rating: 5 }
        ],
        images: ["", "", ""]
    };

    const DEFAULT_FAQ = [
        { question: "Como funciona a primeira sessão?", answer: "Na primeira sessão, conversamos sobre suas expectativas, histórico e principais demandas. É um momento de acolhimento e sem compromisso." },
        { question: "Qual a duração e valor das sessões?", answer: "As sessões de terapia individual têm 50 minutos e custam R$ 180. Terapia de casal tem duração de 1h15 por R$ 280." },
        { question: "Você atende por plano de saúde?", answer: "Não atendo diretamente por convênio, mas emito nota fiscal e documentação completa para você solicitar reembolso ao seu plano." },
        { question: "Posso fazer terapia online?", answer: "Sim! Atendo presencialmente em Blumenau/SC e também online, com a mesma qualidade e sigilo profissional." }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);

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
        }
    }, [isEditorMode, onEditAction, customization]);

    return (
        <div className="sunny-wrapper">

            {/* 1. NAVBAR */}
            <nav className="sunny-nav">
                <div className="sunny-container sunny-nav-inner">
                    <EditableText id="sn_logo" defaultText={d.name} className="sunny-logo" tagName="div" {...editProps} />

                    <div className="sunny-nav-links hidden md:flex">
                        <a href="#about" className="sunny-nav-link"><EditableText id="sn_nav_1" defaultText="Sobre" tagName="span" {...editProps} /></a>
                        <a href="#services" className="sunny-nav-link"><EditableText id="sn_nav_2" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <a href="#benefits" className="sunny-nav-link"><EditableText id="sn_nav_3" defaultText="Benefícios" tagName="span" {...editProps} /></a>
                        <div className="flex items-center gap-3 ml-2">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsClientDashboardOpen(true)}
                                        className="flex items-center gap-1 text-sm font-bold text-[var(--sunny-primary)] hover:opacity-80"
                                    >
                                        <CalendarCheck size={14} />
                                        <EditableText id="sn_nav_dash" defaultText="Minha Área" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-bold text-[var(--sunny-primary)] hover:opacity-80">
                                        <EditableText id="sn_nav_login" defaultText="Entrar" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-bold text-[var(--sunny-primary)] hover:opacity-80">
                                        <EditableText id="sn_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} />
                                    </button>
                                </>
                            )}
                        </div>
                        <button onClick={onBook} className="sunny-btn sunny-btn-primary ml-2">
                            <EditableText id="sn_nav_cta" defaultText="Marcar Consulta" tagName="span" {...editProps} />
                        </button>
                    </div>

                    <button className="md:hidden text-[var(--sunny-primary)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b p-4 flex flex-col gap-4 shadow-sm">
                        <a href="#about" onClick={() => setMobileMenuOpen(false)}><EditableText id="sn_mob_1" defaultText="Sobre" tagName="span" {...editProps} /></a>
                        <a href="#services" onClick={() => setMobileMenuOpen(false)}><EditableText id="sn_mob_2" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <button onClick={onBook} className="sunny-btn sunny-btn-primary w-full"><EditableText id="sn_mob_cta" defaultText="Agendar" tagName="span" {...editProps} /></button>
                    </div>
                )}
            </nav>

            {/* 2. HERO */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="sunny-hero">
                    <div className="sunny-container sunny-hero-grid">
                        <div>
                            <div className="inline-block p-2 bg-orange-100 rounded-lg text-[var(--sunny-primary)] mb-4">
                                <Sun size={24} />
                            </div>
                            <EditableText id="sn_hero_title" defaultText={d.heroTitle} className="sunny-heading text-5xl md:text-6xl mb-6" tagName="h1" {...editProps} />
                            <EditableText id="sn_hero_sub" defaultText={d.heroSub} className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed" tagName="p" {...editProps} />
                            <div className="flex gap-4">
                                <button onClick={onBook} className="sunny-btn sunny-btn-primary">
                                    <EditableText id="sn_hero_cta1" defaultText="Começar Agora" tagName="span" {...editProps} />
                                </button>
                                <a href="#focus" className="sunny-btn sunny-btn-outline">
                                    <EditableText id="sn_hero_cta2" defaultText="Saiba Mais" tagName="span" {...editProps} />
                                </a>
                            </div>
                        </div>
                        <div>
                            <div className="sunny-hero-img-blob group relative">
                                <EditableImage
                                    editKey="coverImage"
                                    currentSrc={heroImage}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="sunny-hero-img"
                                    label="Alterar Capa"
                                    alt="Hero"
                                />
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* 3. FOCUS */}
            {customization?.visibleSections?.['highlights'] !== false && (
                <section id="focus" className="sunny-focus">
                    <div className="sunny-container">
                        <EditableText id="sn_foc_title" defaultText={d.focTitle} className="sunny-heading text-3xl mb-12" tagName="h2" {...editProps} />
                        <div className="sunny-focus-grid">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="sunny-card text-center border-t-4 border-t-[var(--sunny-primary)]">
                                    <h3 className="font-bold text-xl mb-2">
                                        <EditableText id={`sn_foc_t${i}`} defaultText={i === 1 ? "Ansiedade" : i === 2 ? "Autoestima" : "Relacionamentos"} tagName="span" {...editProps} />
                                    </h3>
                                    <EditableText id={`sn_foc_d${i}`} defaultText={i === 1 ? "Aprenda técnicas para lidar com crises e recuperar sua paz interior." : i === 2 ? "Desenvolva uma relação mais saudável consigo mesma." : "Melhore sua comunicação e conexão com quem você ama."} className="text-sm text-gray-500" tagName="div" {...editProps} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. ABOUT */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="sunny-about">
                    <div className="sunny-container grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative group">
                            <EditableImage
                                editKey="aboutImage"
                                currentSrc={aboutImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="sunny-about-img object-cover"
                                label="Alterar Foto"
                                alt="About"
                            />
                        </div>
                        <div>
                            <h4 className="text-[var(--sunny-primary)] font-bold uppercase tracking-wider text-sm mb-2"><EditableText id="sn_abt_pre" defaultText="Sobre Mim" tagName="span" {...editProps} /></h4>
                            <EditableText id="sn_abt_title" defaultText={d.abtTitle} className="sunny-heading text-4xl mb-6" tagName="h2" {...editProps} />
                            <EditableText id="sn_abt_txt" defaultText="Sou psicóloga clínica formada pela FURB, com especialização em Terapia Cognitivo-Comportamental. Há mais de 8 anos ajudo pessoas a superarem ansiedade, baixa autoestima e dificuldades nos relacionamentos. Meu consultório é um espaço acolhedor onde você pode se expressar livremente, sem julgamentos." className="text-lg text-gray-600 mb-8 leading-relaxed" tagName="p" {...editProps} />
                            <div className="flex gap-8">
                                <div>
                                    <h5 className="font-bold text-2xl text-[var(--sunny-primary)]"><EditableText id="sn_stat_1_num" defaultText="8+" tagName="span" {...editProps} /></h5>
                                    <span className="text-sm text-gray-500"><EditableText id="sn_stat_1_txt" defaultText="Anos de Experiência" tagName="span" {...editProps} /></span>
                                </div>
                                <div>
                                    <h5 className="font-bold text-2xl text-[var(--sunny-primary)]"><EditableText id="sn_stat_2_lbl" defaultText="CRP" tagName="span" {...editProps} /></h5>
                                    <span className="text-sm text-gray-500"><EditableText id="sn_stat_2_val" defaultText="12/18547" tagName="span" {...editProps} /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. SERVICES */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="sunny-services">
                    <div className="sunny-container">
                        <div className="text-center mb-12">
                            <EditableText id="sn_srv_title" defaultText={d.srvTitle} className="sunny-heading text-3xl" tagName="h2" {...editProps} />
                        </div>
                        <div className="sunny-services-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                <div key={i} className="sunny-card flex flex-col items-center text-center hover:bg-orange-50 transition-colors">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-[var(--sunny-primary)]">
                                        <EditableIcon id={`sn_srv_i${i}`} defaultIcon={i === 0 ? "Heart" : i === 1 ? "MessageCircle" : "Smile"} size={28} {...editProps} />
                                    </div>
                                    <EditableText id={`sn_srv_t${i}`} defaultText={service.title} className="font-bold text-xl mb-2 block" tagName="h3" {...editProps} />
                                    <EditableText id={`sn_srv_d${i}`} defaultText={service.description} className="text-sm text-gray-500" tagName="div" {...editProps} />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-orange-100 p-2 rounded-full text-orange-600 hover:bg-red-50 hover:text-red-600 transition-colors z-20"
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
                                    className="sunny-card border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 flex flex-col items-center justify-center cursor-pointer min-h-[250px] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center mb-4">
                                        <Plus className="text-orange-600" size={24} />
                                    </div>
                                    <span className="font-bold text-orange-700 text-lg">Adicionar Serviço</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. METHOD (TIMELINE) */}
            {customization?.visibleSections?.['method'] !== false && (
                <section className="sunny-method">
                    <div className="sunny-container">
                        <EditableText id="sn_met_title" defaultText={d.metTitle} className="font-bold text-3xl mb-4 block" tagName="h2" {...editProps} />
                        <p className="opacity-90 mb-8"><EditableText id="sn_met_sub" defaultText="Conheça as etapas do nosso trabalho juntos." tagName="span" {...editProps} /></p>

                        <div className="sunny-timeline">
                            <div className="sunny-step">
                                <span className="text-4xl font-bold opacity-30 block mb-2">01</span>
                                <h3 className="font-bold text-xl mb-2"><EditableText id="sn_step_1_t" defaultText="Acolhimento" tagName="span" {...editProps} /></h3>
                                <p className="text-sm opacity-80"><EditableText id="sn_step_1_d" defaultText="Primeira sessão para nos conhecermos e entender suas necessidades." tagName="span" {...editProps} /></p>
                            </div>
                            <div className="sunny-step">
                                <span className="text-4xl font-bold opacity-30 block mb-2">02</span>
                                <h3 className="font-bold text-xl mb-2"><EditableText id="sn_step_2_t" defaultText="Planejamento" tagName="span" {...editProps} /></h3>
                                <p className="text-sm opacity-80"><EditableText id="sn_step_2_d" defaultText="Definimos metas terapêuticas personalizadas para você." tagName="span" {...editProps} /></p>
                            </div>
                            <div className="sunny-step">
                                <span className="text-4xl font-bold opacity-30 block mb-2">03</span>
                                <h3 className="font-bold text-xl mb-2"><EditableText id="sn_step_3_t" defaultText="Transformação" tagName="span" {...editProps} /></h3>
                                <p className="text-sm opacity-80"><EditableText id="sn_step_3_d" defaultText="Sessões semanais com técnicas comprovadas para sua evolução." tagName="span" {...editProps} /></p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 7. BENEFITS */}
            {customization?.visibleSections?.['benefits'] !== false && (
                <section id="benefits" className="sunny-benefits">
                    <div className="sunny-container text-center">
                        <EditableText id="sn_ben_title" defaultText={d.benTitle} className="sunny-heading text-3xl mb-8" tagName="h2" {...editProps} />
                        <div className="sunny-benefits-list text-left">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="sunny-benefit-item">
                                    <CheckCircle className="text-[var(--sunny-primary)]" />
                                    <EditableText id={`sn_ben_t${i}`} defaultText={i === 1 ? "Redução da ansiedade e ataques de pânico" : i === 2 ? "Melhora na autoestima e autoconfiança" : i === 3 ? "Relacionamentos mais saudáveis e comunicativos" : "Clareza mental e foco nos seus objetivos"} tagName="span" {...editProps} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. TESTIMONIALS */}
            {customization?.visibleSections?.['testimonials'] !== false && (
                <section className="sunny-reviews">
                    <div className="sunny-container">
                        <EditableText id="sn_tst_title" defaultText={d.tstTitle} className="sunny-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div className="grid md:grid-cols-3 gap-6">
                            {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : DEFAULT_TESTIMONIALS.testimonials).map((item: any, i: number) => (
                                <div key={i} className="sunny-card relative group">
                                    <div className="text-[var(--sunny-accent)] mb-4 flex justify-center md:justify-start gap-1" title={isEditorMode ? "Alterar avaliação" : ""}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                                key={s}
                                                size={20}
                                                className={`cursor-pointer ${s <= (item.rating || 5) ? 'fill-[var(--sunny-accent)]' : 'text-orange-200'}`}
                                                fill={s <= (item.rating || 5) ? "currentColor" : "none"}
                                                onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                            />
                                        ))}
                                    </div>
                                    <EditableText id={`sn_rev_t${i}`} defaultText={item.text} className="text-gray-600 mb-6 italic block" tagName="p" {...editProps} />

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 relative shrink-0">
                                            <EditableImage
                                                editKey={`testimonialImages__${i}`}
                                                currentSrc={customization?.testimonialImages?.[i]}
                                                isEditorMode={isEditorMode}
                                                onEditAction={onEditAction}
                                                className="w-full h-full object-cover"
                                                alt={item.author}
                                                renderPlaceholder={() => <div className="w-full h-full bg-[var(--sunny-accent)] opacity-20"></div>}
                                            />
                                        </div>
                                        <div>
                                            <EditableText id={`sn_rev_a${i}`} defaultText={item.author} className="font-bold text-sm block" tagName="span" {...editProps} />
                                            <EditableText id={`cl_test_role_${i}`} defaultText={item.role} className="text-xs opacity-60 block" tagName="span" {...editProps} />
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
                                    className="sunny-card border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors group"
                                >
                                    <Plus className="text-orange-500 mb-2" size={32} />
                                    <span className="font-bold text-orange-600">Adicionar Depoimento</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 9. FAQ */}
            {customization?.visibleSections?.['faq'] !== false && (
                <section className="sunny-faq">
                    <div className="sunny-container max-w-2xl">
                        <EditableText id="sn_faq_title" defaultText={d.faqTitle} className="sunny-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div>
                            <div>
                                {(customization?.faq && customization.faq.length > 0 ? customization.faq : DEFAULT_FAQ).map((faq: any, i: number) => (
                                    <div key={i} className="sunny-faq-item">
                                        <div className="flex justify-between items-center cursor-pointer font-bold" onClick={() => toggleFaq(i)}>
                                            <EditableText id={`sn_fq_q${i}`} defaultText={faq.question} tagName="span" {...editProps} />
                                            {openFaq === i ? <X size={20} /> : <Plus size={20} />}
                                        </div>
                                        {openFaq === i && (
                                            <div className="mt-4 text-gray-600">
                                                <EditableText id={`sn_fq_a${i}`} defaultText={faq.answer} tagName="p" {...editProps} />
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
                                        className="w-full py-4 border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 flex items-center justify-center gap-2 rounded-xl transition-colors group mt-4"
                                    >
                                        <Plus className="text-orange-600" size={20} />
                                        <span className="font-bold text-orange-700">Adicionar Pergunta</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 10. CONTACT */}
            {customization?.visibleSections?.['contact'] !== false && (
                <section className="sunny-contact">
                    <div className="sunny-container text-center">
                        <div className="max-w-2xl mx-auto">
                            <EditableText id="sn_cta_title" defaultText={d.ctaTitle} className="sunny-heading text-4xl mb-6" tagName="h2" {...editProps} />
                            <p className="text-gray-500 mb-8"><EditableText id="sn_cta_desc" defaultText="O primeiro passo é o mais importante. Agende uma sessão de acolhimento sem compromisso." tagName="span" {...editProps} /></p>
                            <button onClick={onBook} className="sunny-btn sunny-btn-primary px-8 py-3 text-lg shadow-lg">
                                <EditableText id="sn_cta_btn" defaultText="Agendar Agora" tagName="span" {...editProps} /> <Calendar className="ml-2" size={20} />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Standard Footer */}
            <StandardFooter
                storeName={d.name}
                storeId={store?.id}
                rating={store?.rating}
                totalReviews={store?.totalReviews}
                customization={customization}
                isEditorMode={isEditorMode}
                onEditAction={onEditAction}
                primaryColor={customization?.primaryColor || '#f59e0b'}
                accentColor={customization?.accentColor || '#f59e0b'}
            />

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

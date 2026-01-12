import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Leaf, Sun, Wind, Heart, Star,
    ArrowRight, ChevronDown, CheckCircle, Plus, Trash2, User as UserIcon, LogOut, CalendarCheck
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
import './LandingPageHarmony.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageHarmony = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

    // Defaults
    const d = {
        name: store?.name || "Espaço Harmonia",

        // 1. Hero
        heroTitle: customization?.welcomeTitle || "Encontre seu equilíbrio natural",
        heroSub: customization?.welcomeMessage || "Uma abordagem terapêutica focada em mindfulness, autoconhecimento e paz interior.",

        // 2. Empathy
        empTitle: "Como você se sente hoje?",

        // 3. About
        aboutTitle: customization?.aboutTitle || "Minha Essência",
        aboutText: customization?.aboutText || "Acredito que a cura vem de dentro para fora. Meu trabalho é guiar você nessa jornada de volta para si mesmo, com acolhimento e técnicas que integram mente e corpo.",

        // 4. Services
        servTitle: "Caminhos de Tratamento",

        // 5. Benefits
        benTitle: "Por que buscar o equilíbrio?",

        // 6. Methodology
        methTitle: "Modalidades de Atendimento",

        // 7. Testimonials
        testTitle: "Relatos de Transformação",

        // 8. FAQ
        faqTitle: "Perguntas Comuns",

        // 9. Contact
        contactTitle: "Inicie sua Jornada",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (idx: number) => setOpenFaq(idx === openFaq ? null : idx);



    const DEFAULT_TESTIMONIALS = {
        testimonials: [
            { text: '"Me ajudou a ver a vida de outra forma."', author: "Paciente A.", role: "Paciente", rating: 5 },
            { text: '"Ambiente muito acolhedor e profissional."', author: "Paciente B.", role: "Paciente", rating: 5 },
            { text: '"Recomendo para todos que buscam autoconhecimento."', author: "Paciente C.", role: "Paciente", rating: 5 }
        ],
        images: ["", "", ""]
    };

    const DEFAULT_SERVICES = [
        { title: "Individual", description: "Sessões personalizadas focadas nas suas necessidades." },
        { title: "Casais", description: "Espaço de diálogo para reconstrução de vínculos." },
        { title: "Online", description: "Atendimento remoto com a mesma qualidade do presencial." }
    ];

    const DEFAULT_FAQ = [
        { question: "O que é Mindfulness?", answer: "É a prática de estar plenamente presente no momento, sem julgamentos." },
        { question: "A terapia ajuda na ansiedade?", answer: "Sim, fornecemos ferramentas para acalmar a mente e gerenciar emoções." },
        { question: "Qual a frequência ideal?", answer: "Geralmente recomendamos sessões semanais para criar um ritmo de evolução." }
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
        <div className="harmony-wrapper">

            {/* 1. NAVBAR */}
            <nav className="harmony-nav">
                <div className="harmony-container harmony-nav-inner">
                    <EditableText id="hm_logo" defaultText={d.name} className="harmony-logo" tagName="div" {...editProps} />

                    <div className="harmony-nav-links hidden md:flex">
                        <a href="#empathy" className="harmony-nav-link"><EditableText id="hm_nav_1" defaultText="Bem-estar" tagName="span" {...editProps} /></a>
                        <a href="#about" className="harmony-nav-link"><EditableText id="hm_nav_2" defaultText="Sobre" tagName="span" {...editProps} /></a>
                        <a href="#services" className="harmony-nav-link"><EditableText id="hm_nav_3" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <a href="#contact" className="harmony-nav-link"><EditableText id="hm_nav_4" defaultText="Contato" tagName="span" {...editProps} /></a>
                        <div className="flex items-center gap-4 ml-2">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsClientDashboardOpen(true)}
                                        className="flex items-center gap-1 text-sm font-medium text-[var(--harmony-primary)] hover:opacity-80"
                                    >
                                        <CalendarCheck size={14} />
                                        <EditableText id="hm_nav_dash" defaultText="Minha Área" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-[var(--harmony-text)] hover:text-[var(--harmony-primary)] transition-colors">
                                        <EditableText id="hm_nav_login" defaultText="Entrar" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-[var(--harmony-text)] hover:text-[var(--harmony-primary)] transition-colors">
                                        <EditableText id="hm_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} />
                                    </button>
                                </>
                            )}
                        </div>
                        <button onClick={onBook} className="harmony-btn harmony-btn-primary">
                            <EditableText id="hm_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
                        </button>
                    </div>

                    <button className="md:hidden text-[var(--harmony-heading)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b p-4 flex flex-col gap-4 shadow-sm">
                        <a href="#about" onClick={() => setMobileMenuOpen(false)}><EditableText id="hm_mob_1" defaultText="Sobre" tagName="span" {...editProps} /></a>
                        <a href="#services" onClick={() => setMobileMenuOpen(false)}><EditableText id="hm_mob_2" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <button onClick={onBook} className="harmony-btn harmony-btn-primary w-full"><EditableText id="hm_mob_cta" defaultText="Agendar" tagName="span" {...editProps} /></button>
                    </div>
                )}
            </nav>

            {/* 2. HERO */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="harmony-hero">
                    <div className="harmony-container harmony-hero-grid">
                        <div>
                            <Leaf className="text-[var(--harmony-primary)] mb-4 animate-bounce" size={32} />
                            <EditableText id="hm_hero_title" defaultText={d.heroTitle} className="harmony-heading text-5xl md:text-6xl mb-6 leading-tight" tagName="h1" {...editProps} />
                            <EditableText id="hm_hero_sub" defaultText={d.heroSub} className="text-xl text-[var(--harmony-text)] mb-8 leading-relaxed opacity-90" tagName="p" {...editProps} />
                            <div className="flex gap-4">
                                <button onClick={onBook} className="harmony-btn harmony-btn-primary">
                                    <EditableText id="hm_hero_cta1" defaultText="Começar Agora" tagName="span" {...editProps} /> <ArrowRight size={16} />
                                </button>
                                <a href="#empathy" className="harmony-btn harmony-btn-outline">
                                    <EditableText id="hm_hero_cta2" defaultText="Saiba Mais" tagName="span" {...editProps} />
                                </a>
                            </div>
                        </div>
                        <div>
                            <div className="harmony-hero-img-mask bg-[#e8ece9] relative group">
                                <EditableImage
                                    editKey="coverImage"
                                    currentSrc={heroImage}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="harmony-hero-img"
                                    label="Alterar Capa"
                                    alt="Harmony Hero"
                                />
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* 3. EMPATHY */}
            {customization?.visibleSections?.['highlights'] !== false && (
                <section id="empathy" className="harmony-empathy">
                    <div className="harmony-container">
                        <EditableText id="hm_emp_title" defaultText={d.empTitle} className="harmony-heading text-3xl mb-12" tagName="h2" {...editProps} />
                        <div className="harmony-empathy-grid">
                            <div className="harmony-card">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[var(--harmony-primary)] mb-4 mx-auto">
                                    <EditableIcon id="hm_emp_i1" defaultIcon="Wind" size={24} {...editProps} />
                                </div>
                                <EditableText id="hm_emp_t1" defaultText="Mente Agitada" className="font-bold text-lg mb-2 block" tagName="h3" {...editProps} />
                                <EditableText id="hm_emp_d1" defaultText="Dificuldade para relaxar e excesso de pensamentos." className="text-sm opacity-80" tagName="p" {...editProps} />
                            </div>
                            <div className="harmony-card">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[var(--harmony-primary)] mb-4 mx-auto">
                                    <EditableIcon id="hm_emp_i2" defaultIcon="Heart" size={24} {...editProps} />
                                </div>
                                <EditableText id="hm_emp_t2" defaultText="Desconexão" className="font-bold text-lg mb-2 block" tagName="h3" {...editProps} />
                                <EditableText id="hm_emp_d2" defaultText="Sentimento de vazio ou falta de propósito." className="text-sm opacity-80" tagName="p" {...editProps} />
                            </div>
                            <div className="harmony-card">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[var(--harmony-primary)] mb-4 mx-auto">
                                    <EditableIcon id="hm_emp_i3" defaultIcon="Sun" size={24} {...editProps} />
                                </div>
                                <EditableText id="hm_emp_t3" defaultText="Fadiga" className="font-bold text-lg mb-2 block" tagName="h3" {...editProps} />
                                <EditableText id="hm_emp_d3" defaultText="Cansaço emocional e físico constante." className="text-sm opacity-80" tagName="p" {...editProps} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 4. ABOUT */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="harmony-about">
                    <div className="harmony-container harmony-about-flex">
                        <div className="flex-1">
                            <EditableText id="hm_ab_sub" defaultText="Sobre a Profissional" className="harmony-subtitle" tagName="span" {...editProps} />
                            <EditableText id="hm_ab_title" defaultText={d.aboutTitle} className="harmony-heading text-4xl mb-6" tagName="h2" {...editProps} />
                            <EditableText id="hm_ab_txt" defaultText={d.aboutText} className="text-lg leading-relaxed mb-8" tagName="div" {...editProps} />
                            <button onClick={onBook} className="harmony-btn harmony-btn-primary">
                                <EditableText id="hm_ab_cta" defaultText="Conhecer Abordagem" tagName="span" {...editProps} />
                            </button>
                        </div>
                        <div className="harmony-about-img bg-white relative group flex items-center justify-center">
                            <EditableImage
                                editKey="aboutImage"
                                currentSrc={aboutImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover rounded-[20px]"
                                label="Foto Perfil"
                                alt="About"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* 5. SERVICES */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="harmony-services">
                    <div className="harmony-container">
                        <div className="text-center mb-12">
                            <EditableText id="hm_srv_title" defaultText={d.servTitle} className="harmony-heading text-3xl" tagName="h2" {...editProps} />
                        </div>
                        <div className="harmony-services-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                <div key={i} className="harmony-card border-none bg-[#f8faf8] hover:bg-white text-center p-8">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-[var(--harmony-primary)]">
                                        <EditableIcon id={`hm_srv_i${i}`} defaultIcon={i === 0 ? "User" : i === 1 ? "Users" : "Globe"} size={28} {...editProps} />
                                    </div>
                                    <EditableText id={`hm_srv_t${i}`} defaultText={service.title} className="font-bold text-xl mb-3 block" tagName="h3" {...editProps} />
                                    <EditableText id={`hm_srv_d${i}`} defaultText={service.description} className="text-sm opacity-70" tagName="p" {...editProps} />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-green-50 p-2 rounded-full text-green-700 hover:bg-red-50 hover:text-red-600 transition-colors z-20"
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
                                    className="harmony-card border-2 border-dashed border-green-300 bg-green-50/50 hover:bg-green-100/50 flex flex-col items-center justify-center cursor-pointer min-h-[250px] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-4">
                                        <Plus className="text-green-600" size={24} />
                                    </div>
                                    <span className="font-bold text-green-700 text-lg">Adicionar Serviço</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. BENEFITS */}
            {customization?.visibleSections?.['benefits'] !== false && (
                <section className="harmony-benefits">
                    <div className="harmony-container">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <EditableText id="hm_ben_title" defaultText={d.benTitle} className="font-serif text-3xl mb-6" tagName="h2" {...editProps} />
                                <EditableText id="hm_ben_desc" defaultText="A terapia não é apenas sobre resolver problemas, é sobre viver melhor." className="opacity-80 text-lg mb-8 block" tagName="p" {...editProps} />
                            </div>
                            <div className="flex-1 harmony-benefits-list mt-0">
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CheckCircle size={20} /> <EditableText id="hm_ben_t1" defaultText="Clareza" tagName="span" {...editProps} /></h3>
                                    <p className="opacity-70 text-sm"><EditableText id="hm_ben_d1" defaultText="Entenda seus padrões e tome decisões melhores." tagName="span" {...editProps} /></p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CheckCircle size={20} /> <EditableText id="hm_ben_t2" defaultText="Resiliência" tagName="span" {...editProps} /></h3>
                                    <p className="opacity-70 text-sm"><EditableText id="hm_ben_d2" defaultText="Aprenda a lidar com os desafios da vida." tagName="span" {...editProps} /></p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CheckCircle size={20} /> <EditableText id="hm_ben_t3" defaultText="Autoestima" tagName="span" {...editProps} /></h3>
                                    <p className="opacity-70 text-sm"><EditableText id="hm_ben_d3" defaultText="Fortaleça sua relação consigo mesmo." tagName="span" {...editProps} /></p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CheckCircle size={20} /> <EditableText id="hm_ben_t4" defaultText="Relações" tagName="span" {...editProps} /></h3>
                                    <p className="opacity-70 text-sm"><EditableText id="hm_ben_d4" defaultText="Melhore sua comunicação e vínculos." tagName="span" {...editProps} /></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 7. METHODOLOGY */}
            {customization?.visibleSections?.['method'] !== false && (
                <section className="harmony-methodology">
                    <div className="harmony-container">
                        <EditableText id="hm_mtd_title" defaultText={d.methTitle} className="harmony-heading text-3xl" tagName="h2" {...editProps} />
                        <div className="harmony-method-grid">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <LaptopIcon />
                                <h3 className="font-serif text-2xl my-4 text-[var(--harmony-heading)]"><EditableText id="hm_mtd_t1" defaultText="Online" tagName="span" {...editProps} /></h3>
                                <p className="opacity-70"><EditableText id="hm_mtd_d1" defaultText="Atendimento via videochamada segura, no conforto da sua casa. Ideal para quem busca praticidade." tagName="span" {...editProps} /></p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <CoffeeIcon />
                                <h3 className="font-serif text-2xl my-4 text-[var(--harmony-heading)]"><EditableText id="hm_mtd_t2" defaultText="Presencial" tagName="span" {...editProps} /></h3>
                                <p className="opacity-70"><EditableText id="hm_mtd_d2" defaultText="Em nosso consultório acolhedor, preparado para criar um ambiente seguro e confidencial." tagName="span" {...editProps} /></p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 8. TESTIMONIALS */}
            {customization?.visibleSections?.['testimonials'] !== false && (
                <section className="harmony-reviews">
                    <div className="harmony-container">
                        <EditableText id="hm_test_title" defaultText={d.testTitle} className="harmony-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div className="grid md:grid-cols-3 gap-8">
                            {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : DEFAULT_TESTIMONIALS.testimonials).map((item: any, i: number) => (
                                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm relative group">
                                    <div className="flex gap-1 text-[var(--harmony-accent)] mb-4" title={isEditorMode ? "Alterar avaliação" : ""}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                                key={s}
                                                size={14}
                                                className={`cursor-pointer ${s <= (item.rating || 5) ? 'fill-[var(--harmony-accent)]' : 'text-gray-300'}`}
                                                fill={s <= (item.rating || 5) ? "currentColor" : "none"}
                                                onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                            />
                                        ))}
                                    </div>
                                    <EditableText id={`hm_tst_t${i}`} defaultText={item.text} className="italic text-gray-600 mb-4 block" tagName="p" {...editProps} />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative shrink-0">
                                            <EditableImage
                                                editKey={`testimonialImages__${i}`}
                                                currentSrc={customization?.testimonialImages?.[i]}
                                                isEditorMode={isEditorMode}
                                                onEditAction={onEditAction}
                                                className="w-full h-full object-cover"
                                                alt={item.author}
                                                renderPlaceholder={() => <div className="w-full h-full bg-[var(--harmony-primary)] opacity-20"></div>}
                                            />
                                        </div>
                                        <EditableText id={`hm_tst_a${i}`} defaultText={item.author} className="font-bold text-sm" tagName="span" {...editProps} />
                                    </div>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('testimonial-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-gray-50 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors z-20 opacity-0 group-hover:opacity-100"
                                            title="Remover Depoimento"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditorMode && (
                                <button onClick={() => onEditAction?.('testimonial-add')} className="harmony-card border-none border-2 border-dashed border-green-300 bg-green-50/50 hover:bg-green-100/50 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors group">
                                    <Plus className="text-green-600 mb-2" size={24} />
                                    <span className="font-bold text-green-700">Adicionar Depoimento</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 9. FAQ */}
            {customization?.visibleSections?.['faq'] !== false && (
                <section className="harmony-faq">
                    <div className="harmony-container max-w-2xl">
                        <EditableText id="hm_faq_title" defaultText={d.faqTitle} className="harmony-heading text-3xl text-center mb-12" tagName="h2" {...editProps} />
                        <div className="flex flex-col gap-4">
                            {(customization?.faq && customization.faq.length > 0 ? customization.faq : DEFAULT_FAQ).map((f: any, i: number) => (
                                <div key={i} className="harmony-faq-item">
                                    <div className="flex justify-between items-center cursor-pointer font-bold text-[var(--harmony-heading)]" onClick={() => toggleFaq(i)}>
                                        <EditableText id={`hm_fq_q${i}`} defaultText={f.question || f.q} tagName="span" {...editProps} />
                                        <ChevronDown className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openFaq === i && (
                                        <div className="mt-4 opacity-80 leading-relaxed">
                                            <EditableText id={`hm_fq_a${i}`} defaultText={f.answer || f.a} tagName="p" {...editProps} />
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
                                    className="w-full py-4 border-2 border-dashed border-green-300 bg-green-50/50 hover:bg-green-100/50 flex items-center justify-center gap-2 rounded-xl transition-colors group mt-4"
                                >
                                    <Plus className="text-green-600" size={20} />
                                    <span className="font-bold text-green-700">Adicionar Pergunta</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 10. CONTACT / FOOTER */}
            {customization?.visibleSections?.['contact'] !== false && (
                <footer className="harmony-contact" id="contact">
                    <div className="harmony-container text-center">
                        <div className="max-w-xl mx-auto bg-[var(--harmony-secondary)] p-12 rounded-[3rem] relative overflow-hidden">
                            <Leaf className="absolute top-4 left-4 text-white opacity-50" size={64} />
                            <EditableText id="hm_ct_title" defaultText={d.contactTitle} className="harmony-heading text-3xl mb-6 relative z-10" tagName="h2" {...editProps} />
                            <p className="mb-8 opacity-70 relative z-10"><EditableText id="hm_ct_sub" defaultText="Dê o primeiro passo. Agende sua sessão e comece sua transformação." tagName="span" {...editProps} /></p>
                            <button onClick={onBook} className="harmony-btn harmony-btn-primary w-full md:w-auto relative z-10">
                                <EditableText id="hm_ct_cta" defaultText="Agendar Horário" tagName="span" {...editProps} />
                            </button>
                        </div>
                    </div>
                </footer>
            )}

            <div className="harmony-footer">
                <div className="harmony-container flex flex-col items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} {d.name}. <EditableText id="hm_footer_txt" defaultText="Paz e equilíbrio." tagName="span" {...editProps} /></p>
                    <StoreFooterRating
                        storeId={store?.id || 'demo'}
                        rating={store?.rating}
                        totalReviews={store?.totalReviews}
                        color="#a78bfa"
                        isEditorMode={isEditorMode}
                        textColor="#5b21b6"
                    />
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

const LaptopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--harmony-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
);

const CoffeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--harmony-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
);

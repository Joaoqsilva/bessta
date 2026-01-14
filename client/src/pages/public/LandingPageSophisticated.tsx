import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Star, Instagram, Facebook, Phone, Menu, X, Check, Play, ChevronLeft, ChevronRight, Plus, Trash2, User as UserIcon, LogOut, CalendarCheck } from 'lucide-react';
import './LandingPageSophisticated.css';
import { EditOverlay } from '../../components/EditOverlay';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { StandardFooter } from '../../components/StandardFooter';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import type { StoreCustomization } from '../../context/StoreCustomizationService';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageSophisticated = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

    const d = {
        name: store?.name || "Clínica Ser",
        heroTitle: customization?.welcomeTitle || "Transforme sua jornada interior.",
        heroSubtitle: customization?.welcomeMessage || "Um espaço de acolhimento e sofisticação para o seu desenvolvimento pessoal e saúde mental.",
        aboutTitle: customization?.aboutTitle || "Nossa Essência",
        aboutText: customization?.aboutText || "Acreditamos que o ambiente terapêutico deve refletir a paz que buscamos. Nossa clínica oferece um refúgio de tranquilidade no meio da cidade, com profissionais dedicados ao seu bem-estar integral.",
        ctaHero: "Agendar Consulta",
        footerTitle: "Vamos conversar?",
        footerText: "Sua saúde mental merece o melhor cuidado."
    };

    const primaryColor = customization?.primaryColor || "#8b5cf6";
    const iconColor = customization?.iconColor || primaryColor;
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;
    const gallery = customization?.galleryImages || [];

    // Use customization for dynamic styles
    const dynamicStyle = {
        '--soph-primary': primaryColor,
        '--soph-primary-light': customization?.secondaryColor || '#ddd6fe',
        '--soph-text': '#1f2937', // Could be customizable
        '--store-font': customization?.fontFamily ? customization.fontFamily : 'Inter, sans-serif',
        '--soph-icon': iconColor,
    } as React.CSSProperties;

    const editProps = { isEditorMode, onEditAction, customization };

    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const DEFAULT_SERVICES = [
        { title: "Terapia Individual", description: "Sessões focadas nas suas necessidades específicas, promovendo insights e mudanças duradouras." },
        { title: "Terapia de Casal", description: "Espaço para diálogo e reconstrução de vínculos afetivos." },
        { title: "Autoconhecimento", description: "Jornada de descoberta e fortalecimento pessoal." }
    ];

    const DEFAULT_FAQ = [
        { question: "Como funciona a primeira sessão?", answer: "É um momento de acolhimento inicial para entendermos suas demandas e explicarmos método de trabalho." },
        { question: "Aceita convênios?", answer: "Atendemos na modalidade particular e oferecemos recibo para reembolso." },
        { question: "Qual a frequência das sessões?", answer: "Geralmente semanal, mas avaliamos caso a caso conforme a necessidade." }
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                onEditAction('init-services__', JSON.stringify(DEFAULT_SERVICES));
            }
            if (!customization?.faq || customization.faq.length === 0) {
                onEditAction('init-faq__', JSON.stringify(DEFAULT_FAQ));
            }
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                const defaultTestimonials = {
                    testimonials: [
                        { id: '1', text: 'Uma experiência transformadora. Encontrei acolhimento e profissionalismo.', author: 'Mariana Santos', role: 'Paciente', rating: 5 },
                        { id: '2', text: 'Ambiente incrível e atendimento impecável. Super recomendo!', author: 'Carlos Oliveira', role: 'Paciente', rating: 5 },
                        { id: '3', text: 'Me ajudou muito a entender minhas questões e evoluir.', author: 'Fernanda Lima', role: 'Paciente', rating: 5 }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-testimonials__', JSON.stringify(defaultTestimonials));
            }
            if (!customization?.team || customization.team.length === 0) {
                const defaultTeam = {
                    team: [
                        { id: '1', name: 'Dra. Sofia', role: 'Psicóloga Principal', bio: 'Especialista em Terapia Cognitivo-Comportamental com 10 anos de experiência.' },
                        { id: '2', name: 'Dr. André', role: 'Psiquiatra', bio: 'Focado em tratamento humanizado e integrativo.' },
                        { id: '3', name: 'Isabela Costa', role: 'Terapeuta', bio: 'Pós-graduada em Psicologia Positiva e Bem-Estar.' }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-team__', JSON.stringify(defaultTeam));
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isEditorMode, onEditAction, customization]);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };



    return (
        <div className="soph-wrapper" style={dynamicStyle}>

            {/* Header */}
            <header className={`soph-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="soph-container flex justify-between items-center">
                    <div className="font-bold text-2xl tracking-tight relative group">
                        <EditableText id="soph_logo" defaultText={d.name} tagName="span" {...editProps} />
                    </div>

                    <nav className="hidden md:flex gap-8 font-medium text-sm text-[var(--soph-text-light)]">
                        <a href="#services" className="hover:text-[var(--soph-primary)] transition-colors">
                            <EditableText id="soph_nav_1" defaultText="Serviços" tagName="span" {...editProps} />
                        </a>
                        <a href="#about" className="hover:text-[var(--soph-primary)] transition-colors">
                            <EditableText id="soph_nav_2" defaultText="Sobre" tagName="span" {...editProps} />
                        </a>
                        <a href="#gallery" className="hover:text-[var(--soph-primary)] transition-colors">
                            <EditableText id="soph_nav_3" defaultText="Espaço" tagName="span" {...editProps} />
                        </a>

                    </nav>

                    <div className="flex items-center gap-4 border-l border-gray-200 pl-6 ml-4">
                        {user ? (
                            <>
                                <button
                                    onClick={() => setIsClientDashboardOpen(true)}
                                    className="flex items-center gap-1 text-sm font-medium text-[var(--soph-primary)] hover:opacity-80"
                                >
                                    <CalendarCheck size={14} />
                                    <EditableText id="soph_nav_dash" defaultText="Minha Área" tagName="span" {...editProps} />
                                </button>
                                <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                    <LogOut size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--soph-primary)] transition-colors">
                                    <EditableText id="soph_nav_login" defaultText="Entrar" tagName="span" {...editProps} />
                                </button>
                                <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--soph-primary)] transition-colors">
                                    <EditableText id="soph_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} />
                                </button>
                            </>
                        )}
                        <button onClick={onBook} className="soph-btn soph-btn-primary py-2 px-6 text-sm ml-2">
                            <EditableText id="soph_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            {customization?.visibleSections?.['hero'] !== false && (
                <section className="soph-hero">
                    <div className="soph-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-semibold uppercase tracking-wider text-[var(--soph-icon)] mb-6">
                                <Star size={12} fill="currentColor" />
                                <EditableText id="soph_tag" defaultText="Excelência em Terapia" tagName="span" {...editProps} />
                            </div>
                            <EditableText
                                id="soph_hero_title"
                                defaultText={d.heroTitle}
                                className="soph-title"
                                tagName="h1"
                                {...editProps}
                            />
                            <EditableText
                                id="soph_hero_sub"
                                defaultText={d.heroSubtitle}
                                className="soph-subtitle"
                                tagName="p"
                                {...editProps}
                            />

                            <div className="flex gap-4">
                                <button onClick={onBook} className="soph-btn soph-btn-primary">
                                    <EditableText id="soph_hero_cta" defaultText={d.ctaHero} tagName="span" {...editProps} />
                                    <ArrowRight size={18} />
                                </button>
                                <a href="#about" className="soph-btn soph-btn-outline">
                                    <EditableText id="soph_hero_more" defaultText="Conhecer mais" tagName="span" {...editProps} />
                                </a>
                            </div>
                        </div>

                        <div className="relative h-[500px] hidden md:block">
                            {/* Main Hero Image */}
                            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                <EditableImage
                                    editKey="coverImage"
                                    currentSrc={heroImage}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    label="Alterar Capa"
                                    alt="Cover"
                                />
                            </div>

                            {/* Floating Glass Cards */}
                            <div className="absolute -bottom-6 -left-6 soph-glass-card p-4 flex items-center gap-4 w-64 soph-float">
                                <div className="bg-[var(--soph-primary)] text-white p-3 rounded-full">
                                    <EditableIcon id="soph_float_1_icon" defaultIcon="Heart" size={20} {...editProps} />
                                </div>
                                <div>
                                    <EditableText id="soph_float_1_title" defaultText="Acolhimento" className="font-bold text-sm block" tagName="span" {...editProps} />
                                    <EditableText id="soph_float_1_desc" defaultText="Humanizado" className="text-xs text-gray-500 block" tagName="span" {...editProps} />
                                </div>
                            </div>

                            <div className="absolute top-12 -right-6 soph-glass-card p-4 flex items-center gap-4 w-56 soph-float" style={{ animationDelay: '2s' }}>
                                <div className="bg-orange-400 text-white p-3 rounded-full">
                                    <EditableIcon id="soph_float_2_icon" defaultIcon="Sun" size={20} {...editProps} />
                                </div>
                                <div>
                                    <EditableText id="soph_float_2_title" defaultText="Bem-estar" className="font-bold text-sm block" tagName="span" {...editProps} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Services Section */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="py-20 bg-white/50 backdrop-blur-sm">
                    <div className="soph-container">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <EditableText id="soph_serv_title" defaultText="Como podemos ajudar" className="text-3xl font-bold mb-4" tagName="h2" {...editProps} />
                            <EditableText id="soph_serv_sub" defaultText="Abordagens modernas baseadas em evidências para o seu desenvolvimento." className="text-gray-500" tagName="p" {...editProps} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                <div key={i} className="soph-glass-card p-8 hover:bg-white transition-colors">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-[var(--soph-icon)] mb-6">
                                        <EditableIcon id={`soph_card_${i}_icon`} defaultIcon={i === 0 ? 'Brain' : i === 1 ? 'Users' : 'Smile'} size={24} {...editProps} />
                                    </div>
                                    <EditableText id={`soph_card_${i}_title`} defaultText={service.title} className="text-xl font-bold mb-3 block" tagName="h3" {...editProps} />
                                    <EditableText id={`soph_card_${i}_desc`} defaultText={service.description} className="text-gray-500 leading-relaxed text-sm" tagName="p" {...editProps} />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-purple-50 p-2 rounded-full text-purple-400 hover:bg-red-50 hover:text-red-600 transition-colors z-20"
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
                                    className="soph-glass-card p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors border-2 border-dashed border-purple-300 min-h-[250px] group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                        <Plus size={24} />
                                    </div>
                                    <span className="font-bold text-purple-700">Adicionar Serviço</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* About Section */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="py-24">
                    <div className="soph-container soph-about-grid">
                        <div className="soph-mosaic relative group">
                            {/* Simulate mosaic with either dynamic images or placeholders */}
                            <div className="soph-mosaic-item bg-gray-200">
                                <EditableImage
                                    editKey="teamImages__0"
                                    currentSrc={customization?.teamImages?.[0]}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    label="Imagem 1"
                                    alt="Team 1"
                                />
                            </div>
                            <div className="soph-mosaic-item bg-gray-300">
                                <EditableImage
                                    editKey="teamImages__1"
                                    currentSrc={customization?.teamImages?.[1] || aboutImage}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    label="Imagem 2"
                                    alt="Team 2"
                                />
                            </div>
                            <div className="soph-mosaic-item bg-gray-100">
                                <EditableImage
                                    editKey="teamImages__2"
                                    currentSrc={customization?.teamImages?.[2]}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    label="Imagem 3"
                                    alt="Team 3"
                                />
                            </div>
                        </div>

                        <div>
                            <EditableText id="soph_about_label" defaultText="SOBRE NÓS" className="text-sm font-bold text-[var(--soph-primary)] tracking-widest mb-4 block" tagName="span" {...editProps} />
                            <EditableText id="soph_about_title" defaultText={d.aboutTitle} className="text-4xl font-bold mb-6 leading-tight" tagName="h2" {...editProps} />
                            <EditableText id="soph_about_text" defaultText={d.aboutText} className="text-lg text-gray-600 mb-8 leading-relaxed" tagName="div" {...editProps} />

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-[var(--soph-primary)] mb-1">
                                        <EditableText id="soph_stat_1_num" defaultText="10+" tagName="span" {...editProps} />
                                    </div>
                                    <EditableText id="soph_stat_1_txt" defaultText="Anos de Experiência" className="text-sm text-gray-500" tagName="p" {...editProps} />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-[var(--soph-primary)] mb-1">
                                        <EditableText id="soph_stat_2_num" defaultText="500+" tagName="span" {...editProps} />
                                    </div>
                                    <EditableText id="soph_stat_2_txt" defaultText="Pacientes Atendidos" className="text-sm text-gray-500" tagName="p" {...editProps} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Team Section */}
            {customization?.visibleSections?.['team'] !== false && (
                <section id="team" className="py-20 bg-white border-t border-gray-50">
                    <div className="soph-container">
                        <div className="text-center mb-16">
                            <EditableText id="soph_team_title" defaultText="Nossa Equipe" className="text-sm font-bold text-[var(--soph-primary)] tracking-widest uppercase mb-2 block" tagName="span" {...editProps} />
                            <EditableText id="soph_team_sub" defaultText="Quem cuida de você" className="text-3xl font-bold" tagName="h2" {...editProps} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {(customization?.team && customization.team.length > 0 ? customization.team : [
                                { name: 'Dra. Sofia', role: 'Psicóloga Principal', bio: 'Especialista em TCC.' },
                                { name: 'Dr. André', role: 'Psiquiatra', bio: 'Focado em tratamento humanizado.' },
                                { name: 'Isabela Costa', role: 'Terapeuta', bio: 'Pós-graduada em Psicologia Positiva.' }
                            ]).map((member: any, i: number) => (
                                <div key={i} className="soph-glass-card overflow-hidden group relative">
                                    <div className="h-64 bg-gray-100 relative">
                                        <EditableImage
                                            editKey={`teamImages__${i}`}
                                            currentSrc={customization?.teamImages?.[i]}
                                            isEditorMode={isEditorMode}
                                            onEditAction={onEditAction}
                                            className="w-full h-full object-cover"
                                            alt={member.name}
                                            renderPlaceholder={() => (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <EditableIcon id={`soph_team_ph_${i}`} defaultIcon="User" size={48} {...editProps} />
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="p-6">
                                        <EditableText id={`soph_team_n${i}`} defaultText={member.name || 'Nome Profissional'} className="font-bold text-xl mb-1 block" tagName="h3" {...editProps} />
                                        <EditableText id={`soph_team_r${i}`} defaultText={member.role || 'Cargo'} className="text-[var(--soph-primary)] text-sm mb-4 block" tagName="span" {...editProps} />
                                        <EditableText id={`soph_team_b${i}`} defaultText={member.bio || 'Biografia breve.'} className="text-gray-500 text-sm" tagName="p" {...editProps} />
                                    </div>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('team-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-red-50 p-2 rounded-full text-red-600 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditorMode && (
                                <button
                                    onClick={() => onEditAction?.('team-add')}
                                    className="soph-glass-card p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors border-2 border-dashed border-purple-300 min-h-[300px]"
                                >
                                    <Plus size={24} className="text-purple-600 mb-2" />
                                    <span className="font-bold text-purple-700">Adicionar Membro</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Gallery Section */}
            {customization?.visibleSections?.['gallery'] !== false && (
                <section id="gallery" className="py-20 bg-white">
                    <div className="soph-container">
                        <div className="text-center mb-12 relative group">
                            <EditOverlay label="Gerenciar Galeria" action="gallery" isEditorMode={false} onEditAction={undefined} />
                            <EditableText id="soph_gallery_title" defaultText="Nosso Espaço" className="text-3xl font-bold" tagName="h2" {...editProps} />
                        </div>

                        <div className="soph-gallery-grid">
                            {/* Gallery Items */}
                            {(isEditorMode ? (gallery.length > 0 ? gallery : []) : gallery.filter(Boolean)).map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 relative group overflow-hidden">
                                    <EditableImage
                                        editKey={`galleryImages__${idx}`}
                                        currentSrc={img}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        label={`Galeria ${idx + 1}`}
                                        alt={`Gallery ${idx}`}
                                    />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('gallery-remove__' + idx); }}
                                            className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors z-20 backdrop-blur-sm"
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
                                    className="aspect-square border-2 border-dashed border-green-500 bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-2">
                                        <Plus className="text-green-600" size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-green-700">Adicionar Foto</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials Section */}
            {customization?.visibleSections?.['testimonials'] !== false && (
                <section id="testimonials" className="py-20 bg-[var(--soph-bg)] relative overflow-hidden">
                    <div className="soph-container relative z-10">
                        <div className="text-center mb-16">
                            <EditableText id="soph_test_title" defaultText="O que dizem" className="text-sm font-bold text-[var(--soph-primary)] tracking-widest uppercase mb-2 block" tagName="span" {...editProps} />
                            <EditableText id="soph_test_sub" defaultText="Depoimentos" className="text-3xl font-bold" tagName="h2" {...editProps} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : [
                                { id: '1', text: 'Uma experiência transformadora. Encontrei acolhimento e profissionalismo.', author: 'Mariana Santos', role: 'Paciente', rating: 5 },
                                { id: '2', text: 'Ambiente incrível e atendimento impecável. Super recomendo!', author: 'Carlos Oliveira', role: 'Paciente', rating: 5 },
                                { id: '3', text: 'Me ajudou muito a entender minhas questões e evoluir.', author: 'Fernanda Lima', role: 'Paciente', rating: 5 }
                            ]).map((testim: any, i: number) => (
                                <div key={i} className="soph-glass-card p-8 relative group">
                                    <div className="flex gap-1 mb-4 text-[var(--soph-primary)]" title={isEditorMode ? "Alterar avaliação" : ""}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                                key={s}
                                                size={16}
                                                fill={s <= (testim.rating || 5) ? "currentColor" : "none"}
                                                className={`cursor-pointer ${s <= (testim.rating || 5) ? '' : 'text-gray-300'}`}
                                                onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                            />
                                        ))}
                                    </div>
                                    <div className="mb-6 flex gap-1 text-gray-600 italic">
                                        "
                                        <EditableText id={`soph_test_t${i}`} defaultText={testim.text} tagName="span" {...editProps} />
                                        "
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 relative shrink-0">
                                            <EditableImage
                                                editKey={`testimonialImages__${i}`}
                                                currentSrc={customization?.testimonialImages?.[i]}
                                                isEditorMode={isEditorMode}
                                                onEditAction={onEditAction}
                                                className="w-full h-full object-cover"
                                                alt={testim.author}
                                                renderPlaceholder={() => (
                                                    <div className="w-full h-full bg-[var(--soph-primary)] text-white flex items-center justify-center font-bold">
                                                        {testim.author.charAt(0)}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <EditableText id={`soph_test_a${i}`} defaultText={testim.author} className="font-bold text-sm block" tagName="span" {...editProps} />
                                            <EditableText id={`soph_test_r${i}`} defaultText={testim.role || 'Paciente'} className="text-xs text-gray-500 block" tagName="span" {...editProps} />
                                        </div>
                                    </div>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('testimonial-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-red-50 p-2 rounded-full text-red-600 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                className="w-full mt-8 py-8 border-2 border-dashed border-[var(--soph-primary)]/30 hover:bg-[var(--soph-primary)]/5 flex flex-col items-center justify-center cursor-pointer transition-colors group rounded-xl"
                            >
                                <Plus size={24} className="text-[var(--soph-primary)] mb-2" />
                                <span className="font-bold text-[var(--soph-primary)] text-lg">Adicionar Depoimento</span>
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            {customization?.visibleSections?.['faq'] !== false && (
                <section className="py-20 bg-[var(--soph-bg)]">
                    <div className="soph-container max-w-3xl">
                        <EditableText id="soph_faq_title" defaultText="Dúvidas Frequentes" className="text-3xl font-bold text-center mb-12" tagName="h2" {...editProps} />

                        <div className="space-y-4">
                            {(customization?.faq && customization.faq.length > 0 ? customization.faq : DEFAULT_FAQ).map((faq: any, i: number) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFaq(i)}>
                                        <EditableText id={`soph_faq_q_${i}`} defaultText={faq.question} className="font-bold text-lg" tagName="h3" {...editProps} />
                                        <ChevronDown className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openFaq === i && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <EditableText id={`soph_faq_a_${i}`} defaultText={faq.answer} className="text-gray-600" tagName="p" {...editProps} />
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
                                    className="w-full py-4 border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 flex items-center justify-center gap-2 rounded-2xl transition-colors group mt-6"
                                >
                                    <Plus className="text-purple-600" size={24} />
                                    <span className="font-bold text-purple-700">Adicionar Pergunta</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <StandardFooter
                storeName={d.name}
                storeId={store?._id || store?.id || 'demo'}
                rating={store?.rating}
                totalReviews={store?.totalReviews}
                customization={customization}
                isEditorMode={isEditorMode}
                onEditAction={onEditAction}
                primaryColor="var(--soph-primary)"
                accentColor="#c0a080"
                textColor="#4b5563" // gray-600 to match design
                bgColor="#ffffff"
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

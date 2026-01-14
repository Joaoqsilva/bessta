
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, LogOut, CalendarCheck } from 'lucide-react';
import {
    Menu, X, ArrowRight, Star, Shield, Zap, Circle,
    Instagram, Facebook, Twitter, Phone, Plus, ChevronDown, Trash2
} from 'lucide-react';
import './LandingPageModern.css';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { EditableSocialLink } from '../../components/EditableSocialLink';
import { StarRating } from '../../components/StarRating';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import type { SocialLink } from '../../types';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageModern = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

    const d = {
        name: store?.name || "Clínica Lacaniana",
        heroTitle: customization?.welcomeTitle || "O inconsciente é estruturado como uma linguagem",
        heroSubtitle: customization?.welcomeMessage || "Um espaço de escuta analítica para atravessar angústias e reformular sua posição diante do desejo.",
        aboutTitle: customization?.aboutTitle || "Sobre a Abordagem",
        aboutText: customization?.aboutText || "A psicanálise lacaniana orienta-se pelo real, simbólico e imaginário. Aqui, oferecemos uma escuta que visa não apenas o alívio dos sintomas, mas a retificação subjetiva.",
        footerTitle: "Inicie sua Análise",
        footerText: "Agende uma entrevista preliminar."
    };

    const primaryColor = customization?.primaryColor || "#5c7c8a";

    // Custom Styles
    const dynamicStyle = {
        '--modern-primary': primaryColor,
        '--modern-accent': customization?.accentColor || '#e0b0a0',
    } as React.CSSProperties;

    const editProps = { isEditorMode, onEditAction, customization };

    // Images
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;
    const gallery = customization?.galleryImages || [];

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = customization?.faq && customization.faq.length > 0 ? customization.faq : [
        { question: "O que é psicanálise lacaniana?", answer: "É uma orientação clínica baseada no ensino de Jacques Lacan, focada na ética do desejo e na estrutura da linguagem do inconsciente." },
        { question: "Qual a duração das sessões?", answer: "Na psicanálise lacaniana, usamos o tempo lógico. As sessões variam conforme o momento do discurso do analisante (corte)." },
        { question: "Atende online?", a: "Sim, o atendimento online sustenta o dispositivo analítico através da voz e da presença virtual." }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);

        // Auto-populate defaults in Editor Mode if empty
        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                const defaultServices = [
                    { title: "Escuta Livre", description: "Um espaço para falar livremente sobre tudo aquilo que lhe causa angústia, sem julgamentos morais." },
                    { title: "Interpretação", description: "Pontuações que visam abrir novos sentidos e desatar nós psíquicos." },
                    { title: "Ressignificação", description: "Construção de um novo saber sobre si mesmo a partir da própria história." }
                ];
                onEditAction('init-services__', JSON.stringify(defaultServices));
            }
            if (!customization?.faq || customization.faq.length === 0) {
                const defaultFaq = [
                    { question: "O que é psicanálise lacaniana?", answer: "É uma orientação clínica baseada no ensino de Jacques Lacan, focada na ética do desejo e na estrutura da linguagem do inconsciente." },
                    { question: "Qual a duração das sessões?", answer: "Na psicanálise lacaniana, usamos o tempo lógico. As sessões variam conforme o momento do discurso do analisante (corte)." },
                    { question: "Atende online?", answer: "Sim, o atendimento online sustenta o dispositivo analítico através da voz e da presença virtual." }
                ];
                onEditAction('init-faq__', JSON.stringify(defaultFaq));
            }
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                const defaultTestimonials = {
                    testimonials: [
                        { id: '1', text: 'Um espaço de escuta que me permitiu ressignificar minha história.', author: 'Ana Souza', role: 'Analisante', rating: 5 },
                        { id: '2', text: 'A abordagem lacaniana foi fundamental para meu processo.', author: 'Pedro Lima', role: 'Analisante', rating: 5 },
                        { id: '3', text: 'Profissionais éticos e acolhedores.', author: 'Carla Dias', role: 'Analisante', rating: 5 }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-testimonials__', JSON.stringify(defaultTestimonials));
            }
            if (!customization?.team || customization.team.length === 0) {
                const defaultTeam = {
                    team: [
                        { id: '1', name: 'Dra. Luiza', role: 'Psicanalista', bio: 'Membro da Escola Brasileira de Psicanálise.' },
                        { id: '2', name: 'Dr. Ricardo', role: 'Psicanalista', bio: 'Especialista em clínica do sujeito.' },
                        { id: '3', name: 'Mariana', role: 'Psicóloga', bio: 'Focada em atendimento infantil.' }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-team__', JSON.stringify(defaultTeam));
            }
        }
    }, [isEditorMode]);

    return (
        <div className="modern-wrapper" style={dynamicStyle}>
            {/* Background Shapes */}
            <div className="modern-bg-shape" style={{ top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--modern-primary) 0%, transparent 70%)' }}></div>
            <div className="modern-bg-shape" style={{ bottom: '10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--modern-accent) 0%, transparent 70%)' }}></div>

            {/* HEADER */}
            <nav className="modern-nav">
                <div className="modern-container w-full flex justify-between items-center">
                    <div className="font-bold text-xl tracking-tight z-20">
                        <EditableText id="mod_logo" defaultText={d.name} tagName="span" {...editProps} />
                    </div>
                    <div className="modern-nav-links hidden md:flex items-center">
                        <a href="#about"><EditableText id="mod_nav_about" defaultText="Sobre" tagName="span" {...editProps} /></a>
                        <a href="#services"><EditableText id="mod_nav_services" defaultText="Clínica" tagName="span" {...editProps} /></a>
                        <a href="#gallery"><EditableText id="mod_nav_gallery" defaultText="Espaço" tagName="span" {...editProps} /></a>
                        <a href="#gallery"><EditableText id="mod_nav_gallery" defaultText="Espaço" tagName="span" {...editProps} /></a>
                        <a href="#faq"><EditableText id="mod_nav_faq" defaultText="Dúvidas" tagName="span" {...editProps} /></a>

                        <div className="flex items-center gap-4 border-l border-gray-200 pl-4 h-6">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsClientDashboardOpen(true)}
                                        className="flex items-center gap-1 text-sm font-medium text-[var(--modern-primary)] hover:opacity-80"
                                    >
                                        <CalendarCheck size={14} />
                                        <EditableText id="mod_nav_dash" defaultText="Minha Área" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--modern-primary)]">
                                        <EditableText id="mod_nav_login" defaultText="Entrar" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--modern-primary)]">
                                        <EditableText id="mod_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} />
                                    </button>
                                </>
                            )}
                        </div>

                        <button onClick={onBook} className="modern-btn modern-btn-primary ml-2">
                            <EditableText id="mod_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="modern-container modern-hero">
                    <div className="modern-hero-content z-20">
                        <EditableText
                            id="mod_hero_label"
                            defaultText="Clínica de Psicanálise"
                            className="text-[var(--modern-primary)] font-semibold tracking-wider uppercase text-sm mb-4 block"
                            tagName="span"
                            {...editProps}
                        />
                        <EditableText
                            id="mod_hero_title"
                            defaultText={d.heroTitle}
                            tagName="h1"
                            {...editProps}
                        />
                        <EditableText
                            id="mod_hero_sub"
                            defaultText={d.heroSubtitle}
                            tagName="p"
                            {...editProps}
                        />
                        <div className="flex gap-4">
                            <button onClick={onBook} className="modern-btn modern-btn-primary">
                                <EditableText id="mod_hero_cta_1" defaultText="Marcar Consulta" tagName="span" {...editProps} />
                            </button>
                            <a href="#about" className="modern-btn modern-btn-outline flex items-center gap-2">
                                <EditableText id="mod_hero_cta_2" defaultText="Saber mais" tagName="span" {...editProps} />
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                    <div className="modern-hero-image z-10 w-full md:w-1/2 h-[500px] relative">
                        {/* Floating Glass Card - On bottom of cover image */}
                        <div className="absolute bottom-0 right-20 glass-card p-6 max-w-xs animate-float z-30">
                            <EditableIcon id="mod_float_icon" defaultIcon="Quote" size={24} className="text-[var(--modern-primary)] mb-2" customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            <EditableText id="mod_float_text" defaultText='"O desejo é o desejo do Outro."' className="italic text-sm text-gray-600 font-medium" tagName="p" {...editProps} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent z-20 rounded-3xl border border-white/40 pointer-events-none"></div>
                        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative group bg-gray-200">
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
                    </div>
                </header>
            )}

            {/* ABOUT - MOSAIC */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="modern-container modern-about">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 w-full">
                            <div className="modern-mosaic-grid relative group">
                                <EditOverlay label="Gerenciar Fotos" action="about-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                {/* Placeholder pattern if no images, or logic to show multiple images if available in customization specifically for this, 
                                 but for now we use the 'aboutImage' as the main one and placeholders for others or just CSS blocks */}
                                <div className="mosaic-item bg-gray-100">
                                    <EditableImage
                                        editKey="aboutImage"
                                        currentSrc={aboutImage}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover"
                                        label="Alterar Foto"
                                        alt="About Main"
                                    />
                                </div>
                                <div className="mosaic-item bg-gray-200 relative group overflow-hidden">
                                    <EditableImage
                                        editKey="galleryImages__0"
                                        currentSrc={gallery[0]}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover"
                                        label="Imagem 2"
                                        alt="Gallery 1"
                                    />
                                </div>
                                <div className="mosaic-item bg-gray-300 relative group overflow-hidden">
                                    <EditableImage
                                        editKey="galleryImages__1"
                                        currentSrc={gallery[1]}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover"
                                        label="Imagem 3"
                                        alt="Gallery 2"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <EditableText id="mod_about_pre" defaultText="Quem Sou" className="text-[var(--modern-accent)] font-bold tracking-widest uppercase text-sm mb-2 block" tagName="span" {...editProps} />
                            <EditableText id="mod_about_title" defaultText={d.aboutTitle} className="text-4xl font-bold mb-6 block text-[var(--modern-primary)]" tagName="h2" {...editProps} />
                            <div className="glass-card p-8">
                                <EditableText id="mod_about_desc" defaultText={d.aboutText} className="text-lg leading-relaxed text-gray-600" tagName="div" {...editProps} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* SERVICES / HELP */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="modern-services">
                    <div className="modern-container">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <EditableText id="mod_serv_title" defaultText="Como posso te ajudar" className="text-3xl font-bold mb-4 block" tagName="h2" {...editProps} />
                            <EditableText id="mod_serv_desc" defaultText="Atravessando o fantasma fundamental." className="text-gray-500" tagName="p" {...editProps} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : [
                                { title: "Escuta Livre", description: "Um espaço para falar livremente sobre tudo aquilo que lhe causa angústia, sem julgamentos morais." },
                                { title: "Interpretação", description: "Pontuações que visam abrir novos sentidos e desatar nós psíquicos." },
                                { title: "Ressignificação", description: "Construção de um novo saber sobre si mesmo a partir da própria história." }
                            ]).map((service: any, i: number) => (
                                <div key={i} className="service-card glass-card">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--modern-primary)]/10 flex items-center justify-center text-[var(--modern-primary)] mb-6">
                                        <EditableIcon id={`mod_serv_icon_${i}`} defaultIcon={i === 0 ? "Mic" : i === 1 ? "Brain" : "Feather"} size={24} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                    </div>
                                    <EditableText id={`mod_serv_t_${i}`} defaultText={service.title} className="text-xl font-bold mb-3 block" tagName="h3" {...editProps} />
                                    <EditableText id={`mod_serv_d_${i}`} defaultText={service.description} className="text-sm text-gray-500 leading-relaxed" tagName="p" {...editProps} />
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
                                    className="glass-card aspect-auto flex flex-col items-center justify-center cursor-pointer hover:bg-green-50/50 transition-colors border-2 border-dashed border-green-300 min-h-[200px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                                        <Plus size={24} />
                                    </div>
                                    <span className="font-bold text-green-700">Adicionar Serviço</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Team Section */}
            {customization?.visibleSections?.['team'] !== false && (
                <section id="team" className="py-20 bg-[var(--modern-bg)]">
                    <div className="modern-container">
                        <div className="text-center mb-16">
                            <EditableText id="mod_team_pre" defaultText="NOSSA EQUIPE" className="text-[var(--modern-accent)] font-bold tracking-widest uppercase text-sm mb-2 block" tagName="span" {...editProps} />
                            <EditableText id="mod_team_title" defaultText="Profissionais" className="text-4xl font-bold mb-6 text-[var(--modern-primary)]" tagName="h2" {...editProps} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {(customization?.team && customization.team.length > 0 ? customization.team : customization?.teamImages?.length ? [] : [
                                { name: 'Dra. Luiza', role: 'Psicanalista', bio: 'Membro da Escola Brasileira de Psicanálise.' }
                            ]).map((member: any, i: number) => (
                                <div key={i} className="glass-card overflow-hidden group relative p-0">
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
                                                    <div className="w-full h-full bg-[var(--modern-primary)]/10 flex items-center justify-center">
                                                        {/* Placeholder Icon */}
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="p-6">
                                        <EditableText id={`mod_team_n${i}`} defaultText={member.name || 'Nome'} className="font-bold text-xl mb-1 block text-[var(--modern-primary)]" tagName="h3" {...editProps} />
                                        <EditableText id={`mod_team_r${i}`} defaultText={member.role || 'Cargo'} className="text-[var(--modern-accent)] text-sm mb-4 block font-semibold" tagName="span" {...editProps} />
                                        <EditableText id={`mod_team_b${i}`} defaultText={member.bio || 'Bio'} className="text-gray-500 text-sm" tagName="p" {...editProps} />
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
                                    className="glass-card p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50/50 transition-colors border-2 border-dashed border-green-300 min-h-[300px]"
                                >
                                    <Plus size={24} className="text-green-600 mb-2" />
                                    <span className="font-bold text-green-700">Adicionar Membro</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* GALLERY */}
            <section id="gallery" className="modern-gallery modern-container relative group">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <EditableText id="mod_gal_title" defaultText="O Espaço" className="text-3xl font-bold mb-2 block" tagName="h2" {...editProps} />
                        <EditableText id="mod_gal_sub" defaultText="Um ambiente preparado para o seu acolhimento." className="text-gray-500" tagName="p" {...editProps} />
                    </div>
                </div>

                <div className="gallery-grid">
                    {/* Gallery Items */}
                    {(isEditorMode ? (gallery.length > 0 ? gallery : []) : gallery.filter(Boolean)).map((img, idx) => (
                        <div key={idx} className="gallery-item group/item relative bg-gray-100 aspect-square rounded-xl overflow-hidden">
                            <EditableImage
                                editKey={`galleryImages__${idx}`}
                                currentSrc={img}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover"
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
                            className="aspect-square rounded-xl border-2 border-dashed border-green-500 bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-2">
                                <Plus className="text-green-600" size={24} />
                            </div>
                            <span className="text-sm font-bold text-green-700">Adicionar Foto</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="modern-container py-20 relative">
                <div className="text-center mb-16">
                    <EditableText id="mod_test_pre" defaultText="DEPOIMENTOS" className="text-[var(--modern-accent)] font-bold tracking-widest uppercase text-sm mb-2 block" tagName="span" {...editProps} />
                    <EditableText id="mod_test_title" defaultText="O que dizem sobre nós" className="text-3xl font-bold mb-6 text-[var(--modern-primary)]" tagName="h2" {...editProps} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : [
                        { id: '1', text: 'Um espaço de escuta que me permitiu ressignificar minha história.', author: 'Ana Souza', role: 'Analisante', rating: 5 },
                        { id: '2', text: 'A abordagem lacaniana foi fundamental para meu processo.', author: 'Pedro Lima', role: 'Analisante', rating: 5 },
                        { id: '3', text: 'Profissionais éticos e acolhedores.', author: 'Carla Dias', role: 'Analisante', rating: 5 }
                    ]).map((testim: any, i: number) => (
                        <div key={i} className="glass-card p-8 relative group">
                            <div className="flex gap-1 mb-4 text-[var(--modern-accent)]" title={isEditorMode ? "Alterar avaliação" : ""}>
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
                            <div className="mb-6 flex gap-1 text-gray-600 italic leading-relaxed">
                                "
                                <EditableText id={`mod_test_t${i}`} defaultText={testim.text} tagName="span" {...editProps} />
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
                                            <div className="w-full h-full bg-[var(--modern-primary)] text-white flex items-center justify-center font-bold">
                                                {testim.author.charAt(0)}
                                            </div>
                                        )}
                                    />
                                </div>
                                <div>
                                    <EditableText id={`mod_test_a${i}`} defaultText={testim.author} className="font-bold text-sm block text-[var(--modern-primary)]" tagName="span" {...editProps} />
                                    <EditableText id={`mod_test_r${i}`} defaultText={testim.role || 'Paciente'} className="text-xs text-gray-500 block" tagName="span" {...editProps} />
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
                        className="w-full mt-8 py-6 border-2 border-dashed border-[var(--modern-primary)]/30 hover:bg-[var(--modern-primary)]/5 flex flex-col items-center justify-center cursor-pointer transition-colors group rounded-xl"
                    >
                        <Plus size={24} className="text-[var(--modern-primary)] mb-2" />
                        <span className="font-bold text-[var(--modern-primary)] text-lg">Adicionar Depoimento</span>
                    </button>
                )}
            </section>

            {/* FAQ */}
            <section id="faq" className="modern-faq bg-white/50">
                <div className="modern-container max-w-3xl">
                    <div className="text-center mb-12">
                        <EditableText id="mod_faq_head" defaultText="Perguntas Frequentes" className="text-3xl font-bold" tagName="h2" {...editProps} />
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq: any, idx: number) => (
                            <div key={idx} className="faq-item">
                                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                                    <EditableText id={`mod_faq_q_${idx}`} defaultText={faq.question || faq.q} tagName="span" {...editProps} />
                                    <ChevronDown className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                                </div>
                                {openFaq === idx && (
                                    <div className="faq-answer">
                                        <EditableText id={`mod_faq_a_${idx}`} defaultText={faq.answer || faq.a} tagName="p" {...editProps} />
                                    </div>
                                )}
                                {isEditorMode && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEditAction?.('faq-remove__' + idx); }}
                                        className="absolute top-4 right-12 text-red-300 hover:text-red-500 transition-colors z-20"
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
                                className="w-full py-3 border-2 border-dashed border-green-400 bg-green-50/50 hover:bg-green-100/50 flex items-center justify-center gap-2 rounded-xl transition-all group mt-6"
                            >
                                <Plus className="text-green-600" size={20} />
                                <span className="font-medium text-green-700">Adicionar Pergunta</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="modern-footer">
                <div className="modern-container text-center">
                    <EditableText id="mod_foot_title" defaultText={d.footerTitle} className="text-2xl font-bold mb-4 block" tagName="h3" {...editProps} />
                    <EditableText id="mod_foot_txt" defaultText={d.footerText} className="text-gray-500 mb-8 block" tagName="p" {...editProps} />

                    <button onClick={onBook} className="modern-btn modern-btn-primary px-8 py-3 mb-12">
                        <EditableText id="mod_foot_btn" defaultText="Agendar Agora" tagName="span" {...editProps} />
                    </button>

                    <div className="max-w-md mx-auto mb-8 flex justify-center">
                        <StoreFooterRating
                            storeId={store?.id || 'demo'}
                            color={primaryColor}
                            rating={store?.rating}
                            totalReviews={store?.totalReviews}
                            isEditorMode={isEditorMode}
                            textColor="#9ca3af" // gray-400
                        />
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>&copy; {new Date().getFullYear()} {d.name}. <EditableText id="mod_footer_copy" defaultText="Todos os direitos reservados." tagName="span" {...editProps} /></p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <EditableSocialLink
                                id="mod_social"
                                links={customization?.socialLinks || []}
                                isEditorMode={isEditorMode}
                                onUpdateLinks={(links) => onEditAction?.('socialLinks', JSON.stringify(links))}
                                iconSize={20}
                                iconClassName="hover:text-[var(--modern-primary)] transition-colors cursor-pointer"
                            />
                        </div>
                    </div>
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

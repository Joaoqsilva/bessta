import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Zap, Activity, Heart, ArrowRight, Play, Plus, Star, Layout, Smile,
    Instagram, Twitter, Linkedin, Sparkles, MessageCircle, Trash2, User as UserIcon, LogOut, CalendarCheck
} from 'lucide-react';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { StarRating } from '../../components/StarRating';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { StandardFooter } from '../../components/StandardFooter';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import './LandingPageVibrant.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageVibrant = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);

    const d = {
        name: store?.name || "NEO.MIND",

        // 1. Hero
        heroTitle: customization?.welcomeTitle || "Revolucione sua Mente",
        heroSub: customization?.welcomeMessage || "Terapia de alta performance baseada em neurociência e design comportamental.",

        // 2. Impact
        impTitle: "Sentindo-se estagnado?",

        // 3. Method
        metTitle: "O Futuro da Terapia",

        // 4. Services
        srvTitle: "Protocolos",

        // 5. Stats
        statTitle: "Resultados",

        // 6. Team
        teamTitle: "Mentes Brilhantes",

        // 7. Experience
        expTitle: "A Experiência",

        // 8. Community
        comTitle: "Comunidade",

        // 9. Contact
        ctaTitle: "Pronto para o Próximo Nível?",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;
    const gallery = customization?.galleryImages || [];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const DEFAULT_SERVICES = [
        { title: "Biohacking Mental", description: "Protocolo intensivo de 4 semanas." },
        { title: "Neuroplasticidade", description: "Exercícios para fortalecer novas conexões." },
        { title: "Gestão do Estresse", description: "Técnicas avançadas de regulação." },
        { title: "Foco e Produtividade", description: "Otimização cognitiva para alta performance." }
    ];

    const DEFAULT_TEAM = {
        team: [
            { name: "Dr. Alex", role: "Neuropsicólogo", bio: "Especialista em neurociência cognitiva." },
            { name: "Dra. Bia", role: "Psiquiatra", bio: "Foco em alta performance mental." },
            { name: "Carlos", role: "Nutricionista", bio: "Nutrição para o cérebro." },
            { name: "Diana", role: "Coach", bio: "Estratégias de vida e carreira." }
        ],
        images: ["", "", "", ""]
    };

    const DEFAULT_TESTIMONIALS = {
        testimonials: [
            { text: '"Incrível como a abordagem mudou minha performance no trabalho e na vida."', author: "Sarah K.", role: "CEO Tech", rating: 5 },
            { text: '"Me sinto muito mais focado e produtivo."', author: "João P.", role: "Designer", rating: 5 },
            { text: '"Uma experiência transformadora."', author: "Ana M.", role: "Médica", rating: 5 }
        ],
        images: ["", "", ""]
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                onEditAction('init-services__', JSON.stringify(DEFAULT_SERVICES));
            }
            if (!customization?.team || customization.team.length === 0) {
                onEditAction('init-team__', JSON.stringify(DEFAULT_TEAM));
            }
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                onEditAction('init-testimonials__', JSON.stringify(DEFAULT_TESTIMONIALS));
            }
        }
    }, [isEditorMode, onEditAction, customization]);

    return (
        <div className="vib-wrapper">

            {/* 1. NAVBAR */}
            <nav className="vib-nav">
                <div className="vib-nav-inner">
                    <EditableText id="vb_logo" defaultText={d.name} className="vib-logo" tagName="div" {...editProps} />

                    <div className="vib-nav-links hidden md:flex">
                        <a href="#method" className="vib-nav-link"><EditableText id="vb_nav_1" defaultText="Metodologia" tagName="span" {...editProps} /></a>
                        <a href="#services" className="vib-nav-link"><EditableText id="vb_nav_2" defaultText="Protocolos" tagName="span" {...editProps} /></a>
                        <a href="#experience" className="vib-nav-link"><EditableText id="vb_nav_3" defaultText="Experiência" tagName="span" {...editProps} /></a>
                        <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4 h-6">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsClientDashboardOpen(true)}
                                        className="flex items-center gap-1 text-sm font-bold text-[var(--vib-accent)] hover:text-white transition-colors"
                                    >
                                        <CalendarCheck size={14} />
                                        <EditableText id="vb_nav_dash" defaultText="Minha Área" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={logout} className="text-white/50 hover:text-red-400 transition-colors" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                                        <EditableText id="vb_nav_login" defaultText="Entrar" tagName="span" {...editProps} />
                                    </button>
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                                        <EditableText id="vb_nav_register" defaultText="Cadastrar" tagName="span" {...editProps} />
                                    </button>
                                </>
                            )}
                        </div>
                        <button onClick={onBook} className="vib-btn vib-btn-primary text-sm px-6 py-2 ml-4">
                            <EditableText id="vb_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
                        </button>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-[#0f101a] border border-white/10 rounded-2xl mt-2 p-4 flex flex-col gap-4 shadow-xl">
                        <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-white"><EditableText id="vb_mob_1" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="text-white"><EditableText id="vb_mob_2" defaultText="Experiência" tagName="span" {...editProps} /></a>
                        <button onClick={onBook} className="vib-btn vib-btn-primary w-full"><EditableText id="vb_mob_cta" defaultText="Agendar" tagName="span" {...editProps} /></button>
                    </div>
                )}
            </nav>

            {/* 2. HERO */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="vib-hero">
                    <div className="vib-bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
                    <div className="vib-bg-glow-2"></div>

                    <div className="vib-container relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-[var(--vib-success)] animate-pulse"></span>
                            <span className="text-xs font-bold tracking-widest uppercase text-white/80"><EditableText id="vb_hero_badge" defaultText="Nova Abordagem 2026" tagName="span" {...editProps} /></span>
                        </div>

                        <EditableText
                            id="vb_hero_title"
                            defaultText={d.heroTitle}
                            className="vib-heading vib-gradient-text text-6xl md:text-8xl mb-8 block max-w-5xl mx-auto"
                            tagName="h1"
                            {...editProps}
                        />

                        <EditableText
                            id="vb_hero_sub"
                            defaultText={d.heroSub}
                            className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
                            tagName="p"
                            {...editProps}
                        />

                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                            <button onClick={onBook} className="vib-btn vib-btn-primary">
                                <EditableText id="vb_hero_cta_main" defaultText="Agendar Sessão" tagName="span" {...editProps} /> <Zap size={20} />
                            </button>
                            <div className="flex items-center gap-3 text-sm font-bold text-white/50">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0f101a]"></div>)}
                                </div>
                                <EditableText id="vb_hero_stats_txt" defaultText="+500 Mentes Transformadas" tagName="span" {...editProps} />
                            </div>
                        </div>

                        <div className="mt-20 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl mx-auto max-w-4xl aspect-video group">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f101a] to-transparent z-10"></div>
                            <EditableImage
                                editKey="coverImage"
                                currentSrc={heroImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover"
                                label="Vídeo/Imagem Hero"
                                alt="Hero"
                                renderPlaceholder={() => (
                                    <div className="w-full h-full bg-[#1a1b26] flex items-center justify-center">
                                        <Play size={64} className="text-white/20 fill-white/20" />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </header>
            )}

            {/* 3. PROBLEM (IMPACT) */}
            {customization?.visibleSections?.['highlights'] !== false && (
                <section className="vib-impact">
                    <div className="vib-container">
                        <div className="vib-bento-grid grid-cols-1 md:grid-cols-2">
                            <div className="vib-card flex flex-col justify-center">
                                <EditableText id="vb_imp_t" defaultText={d.impTitle} className="vib-heading text-4xl mb-6" tagName="h2" {...editProps} />
                                <EditableText id="vb_imp_d" defaultText="Ansiedade moderna, burnout digital e falta de propósito são os novos vilões. Você não precisa enfrentar isso com ferramentas do século passado." className="text-lg text-white/70" tagName="div" {...editProps} />
                            </div>
                            <div className="vib-card bg-[var(--vib-secondary)] border-none">
                                <div className="h-full flex flex-col justify-between">
                                    <Activity className="text-white/20" size={100} />
                                    <h3 className="text-3xl font-bold mt-8"><EditableText id="vb_imp_h3" defaultText="Pare de sobreviver. Comece a prosperar." tagName="span" {...editProps} /></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 4. METHODOLOGY */}
            {customization?.visibleSections?.['method'] !== false && (
                <section id="method" className="vib-method">
                    <div className="vib-container">
                        <EditableText id="vb_met_title" defaultText={d.metTitle} className="vib-heading text-center text-5xl mb-16" tagName="h2" {...editProps} />

                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="vib-card hover:bg-white/5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--vib-primary)] to-[var(--vib-secondary)] flex items-center justify-center mb-6">
                                        <span className="font-bold text-xl">{i}</span>
                                    </div>
                                    <EditableText id={`vb_met_t${i}`} defaultText={i === 1 ? "Mapeamento" : i === 2 ? "Reprogramação" : "Expansão"} className="text-2xl font-bold mb-4 block" tagName="h3" {...editProps} />
                                    <EditableText id={`vb_met_d${i}`} defaultText="Análise profunda dos padrões mentais e bloqueios emocionais." className="text-white/60" tagName="p" {...editProps} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. SERVICES */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="vib-services">
                    <div className="vib-container">
                        <div className="flex justify-between items-end mb-12">
                            <EditableText id="vb_srv_title" defaultText={d.srvTitle} className="vib-heading text-4xl" tagName="h2" {...editProps} />
                            <button onClick={onBook} className="text-[var(--vib-success)] font-bold flex gap-2 items-center"><EditableText id="vb_srv_all" defaultText="Ver tudo" tagName="span" {...editProps} /> <ArrowRight size={16} /></button>
                        </div>
                        <div className="vib-service-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                <div key={i} className="vib-card group cursor-pointer" onClick={onBook}>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="text-[var(--vib-accent)]" />
                                    </div>
                                    <div className="mb-8 p-3 bg-white/5 w-min rounded-lg text-[var(--vib-success)]">
                                        <EditableIcon id={`vb_srv_i${i}`} defaultIcon="Zap" size={24} {...editProps} />
                                    </div>
                                    <EditableText id={`vb_srv_t${i}`} defaultText={service.title} className="text-xl font-bold mb-2 block" tagName="h3" {...editProps} />
                                    <EditableText id={`vb_srv_d${i}`} defaultText={service.description} className="text-sm text-white/50" tagName="span" {...editProps} />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-white/10 p-2 rounded-full text-white/50 hover:bg-red-500/20 hover:text-red-500 transition-colors z-20"
                                            title="Remover Protocolo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditorMode && (
                                <button
                                    onClick={() => onEditAction?.('service-add')}
                                    className="vib-card border-2 border-dashed border-green-500 bg-green-900/10 hover:bg-green-900/20 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-900/30 group-hover:bg-green-900/50 flex items-center justify-center mb-4">
                                        <Plus className="text-green-500" size={24} />
                                    </div>
                                    <span className="font-bold text-green-500 text-lg">Adicionar Protocolo</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. STATS */}
            {customization?.visibleSections?.['stats'] !== false && (
                <section className="vib-stats border-y border-white/5 bg-white/[0.02]">
                    <div className="vib-container flex flex-wrap justify-around gap-8 text-center">
                        <div>
                            <h4 className="text-4xl md:text-6xl font-bold text-white mb-2 font-mono"><EditableText id="vb_stat_1_num" defaultText="98%" tagName="span" {...editProps} /></h4>
                            <p className="text-white/50 uppercase tracking-widest text-xs"><EditableText id="vb_stat_1_txt" defaultText="Satisfação" tagName="span" {...editProps} /></p>
                        </div>
                        <div>
                            <h4 className="text-4xl md:text-6xl font-bold text-white mb-2 font-mono"><EditableText id="vb_stat_2_num" defaultText="24/7" tagName="span" {...editProps} /></h4>
                            <p className="text-white/50 uppercase tracking-widest text-xs"><EditableText id="vb_stat_2_txt" defaultText="Suporte IA" tagName="span" {...editProps} /></p>
                        </div>
                        <div>
                            <h4 className="text-4xl md:text-6xl font-bold text-white mb-2 font-mono"><EditableText id="vb_stat_3_num" defaultText="15+" tagName="span" {...editProps} /></h4>
                            <p className="text-white/50 uppercase tracking-widest text-xs"><EditableText id="vb_stat_3_txt" defaultText="Especialistas" tagName="span" {...editProps} /></p>
                        </div>
                    </div>
                </section>
            )}

            {/* 7. TEAM */}
            {customization?.visibleSections?.['team'] !== false && (
                <section className="vib-team">
                    <div className="vib-container">
                        <EditableText id="vb_tm_title" defaultText={d.teamTitle} className="vib-heading text-center text-4xl mb-16" tagName="h2" {...editProps} />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(customization?.team && customization.team.length > 0 ? customization.team : DEFAULT_TEAM.team).map((member: any, i: number) => (
                                <div key={i} className="vib-card vib-team-card group relative">
                                    <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-slate-800">
                                        <EditableImage
                                            editKey={`teamImages__${i}`}
                                            currentSrc={customization?.teamImages?.[i]}
                                            isEditorMode={isEditorMode}
                                            onEditAction={onEditAction}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            label="Foto"
                                            alt={member.name}
                                            renderPlaceholder={() => (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                                    <EditableIcon id={`vb_tm_p${i}`} defaultIcon="User" size={40} {...editProps} />
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <EditableText id={`vb_tm_n${i}`} defaultText={member.name} className="font-bold text-lg block" tagName="h3" {...editProps} />
                                    <EditableText id={`vb_tm_r${i}`} defaultText={member.role} className="text-sm text-[var(--vib-accent)] block uppercase font-bold" tagName="span" {...editProps} />

                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('team-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-white/10 p-2 rounded-full text-white/50 hover:bg-red-500/20 hover:text-red-500 transition-colors z-20"
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
                                    className="vib-card border-2 border-dashed border-cyan-500 bg-cyan-900/10 hover:bg-cyan-900/20 flex flex-col items-center justify-center cursor-pointer min-h-[250px] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-cyan-900/30 group-hover:bg-cyan-900/50 flex items-center justify-center mb-4">
                                        <Plus className="text-cyan-500" size={24} />
                                    </div>
                                    <span className="font-bold text-cyan-500 text-lg">Adicionar Profissional</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. EXPERIENCE (GALLERY) */}
            {customization?.visibleSections?.['gallery'] !== false && (
                <section id="experience" className="vib-services">
                    <div className="vib-container">
                        <EditableText id="vb_exp_title" defaultText={d.expTitle} className="vib-heading text-4xl mb-12" tagName="h2" {...editProps} />

                        <div className="vib-gallery-grid">
                            {/* Gallery Items */}
                            {(isEditorMode ? (gallery.length > 0 ? gallery : []) : gallery.filter(Boolean)).map((img, idx) => (
                                <div key={idx} className="aspect-square bg-black rounded-3xl overflow-hidden relative rotate-1 hover:rotate-0 transition-transform duration-300 group">
                                    <EditableImage
                                        editKey={`galleryImages__${idx}`}
                                        currentSrc={img}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        label={`Foto ${idx + 1}`}
                                        alt={`Gallery ${idx}`}
                                    />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('gallery-remove__' + idx); }}
                                            className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-white hover:bg-red-500/80 transition-colors z-20 backdrop-blur-sm"
                                            title="Remover Imagem"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add Button (Editor Only) */}
                            {isEditorMode && (
                                <button
                                    onClick={() => onEditAction?.('gallery-add')}
                                    className="aspect-square rounded-3xl border-4 border-dashed border-green-400 bg-white hover:bg-green-50 flex flex-col items-center justify-center cursor-pointer transition-all rotate-1 hover:rotate-0 group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center mb-3">
                                        <Plus className="text-green-600" size={32} />
                                    </div>
                                    <span className="text-lg font-bold text-green-700">Adicionar</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 9. COMMUNITY (TESTIMONIALS) */}
            {customization?.visibleSections?.['testimonials'] !== false && (
                <section className="vib-team pb-20">
                    <div className="vib-container">
                        <EditableText id="vb_com_title" defaultText={d.comTitle} className="vib-heading text-center text-4xl mb-12" tagName="h2" {...editProps} />
                        <div className="grid md:grid-cols-3 gap-6">
                            {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : DEFAULT_TESTIMONIALS.testimonials).map((item: any, i: number) => (
                                <div key={i} className="vib-card relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <MessageCircle className="text-[var(--vib-primary)]" />
                                        <div className="flex gap-1" title={isEditorMode ? "Alterar avaliação" : ""}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={`cursor-pointer transition-colors ${star <= (item.rating || 5) ? 'fill-[var(--vib-accent)] text-[var(--vib-accent)]' : 'text-white/20'}`}
                                                    onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${star}`); } : undefined}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <EditableText id={`vt_rev_t${i}`} defaultText={item.text} className="text-lg leading-relaxed mb-6 block" tagName="p" {...editProps} />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 relative shrink-0">
                                            <EditableImage
                                                editKey={`testimonialImages__${i}`}
                                                currentSrc={customization?.testimonialImages?.[i]}
                                                isEditorMode={isEditorMode}
                                                onEditAction={onEditAction}
                                                className="w-full h-full object-cover"
                                                alt={item.author}
                                                renderPlaceholder={() => <div className="w-full h-full bg-gradient-to-r from-[var(--vib-primary)] to-[var(--vib-accent)]"></div>}
                                            />
                                        </div>
                                        <div>
                                            <EditableText id={`vt_rev_a${i}`} defaultText={item.author} className="font-bold text-sm block" tagName="span" {...editProps} />
                                            <EditableText id={`cl_test_role_${i}`} defaultText={item.role} className="text-xs text-white/50 block" tagName="span" {...editProps} />
                                        </div>
                                    </div>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('testimonial-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-white/10 p-2 rounded-full text-white/50 hover:bg-red-500/20 hover:text-red-500 transition-colors z-20"
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
                                    className="vib-card border-2 border-dashed border-cyan-500 bg-cyan-900/10 hover:bg-cyan-900/20 flex flex-col items-center justify-center cursor-pointer min-h-[200px] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-cyan-900/30 group-hover:bg-cyan-900/50 flex items-center justify-center mb-4">
                                        <Plus className="text-cyan-500" size={24} />
                                    </div>
                                    <span className="font-bold text-cyan-500 text-lg">Adicionar Depoimento</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 10. CONTACT / FOOTER */}
            {customization?.visibleSections?.['contact'] !== false && (
                <>
                    {/* CTA Section */}
                    <section className="vib-footer">
                        <div className="vib-container">
                            <div className="vib-bot-cta">
                                <div className="absolute top-0 right-0 p-32 bg-[var(--vib-accent)] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                                <EditableText id="vb_cta_title" defaultText={d.ctaTitle} className="vib-heading text-5xl md:text-7xl mb-8 relative z-10" tagName="h2" {...editProps} />
                                <button onClick={onBook} className="vib-btn vib-btn-glow text-xl px-12 py-4 relative z-10">
                                    <EditableText id="vb_footer_btn" defaultText="Iniciar Transformação" tagName="span" {...editProps} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Standard Footer */}
                    <StandardFooter
                        storeName={d.name}
                        storeId={store?.id}
                        rating={store?.rating}
                        totalReviews={store?.totalReviews}
                        customization={customization}
                        isEditorMode={isEditorMode}
                        onEditAction={onEditAction}
                        primaryColor={customization?.primaryColor || '#0f101a'}
                        accentColor={customization?.accentColor || '#00ffcc'}
                    />
                </>
            )}

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

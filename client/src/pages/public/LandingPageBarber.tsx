import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Scissors, Star, Clock, MapPin, Phone, Instagram,
    ArrowRight, CheckCircle, Calendar, Plus, Trash2, User as UserIcon, LogOut, CalendarCheck
} from 'lucide-react';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { StandardFooter } from '../../components/StandardFooter';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import './LandingPageBarber.css';

/* ============================================================
   LAYOUT: BARBER SHOP - Design Masculino e Moderno
   ============================================================ */

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageBarber = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const d = {
        name: store?.name || "Urban Barber",
        heroTitle: customization?.welcomeTitle || "Estilo que define quem você é",
        heroSub: customization?.welcomeMessage || "Cortes precisos, barba impecável e ambiente exclusivo para o homem moderno.",
        aboutTitle: "Tradição & Modernidade",
        servicesTitle: "Nossos Serviços",
        teamTitle: "Nossos Barbeiros",
        galleryTitle: "Nosso Trabalho",
        ctaTitle: "Pronto para seu novo visual?",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;

    const DEFAULT_SERVICES = [
        { title: "Corte Clássico", description: "Corte tradicional com acabamento perfeito", price: "R$ 45" },
        { title: "Corte + Barba", description: "Combo completo para o homem moderno", price: "R$ 75" },
        { title: "Barba Completa", description: "Modelagem, hidratação e toalha quente", price: "R$ 40" },
        { title: "Degradê Premium", description: "Fade moderno com design personalizado", price: "R$ 55" }
    ];

    const DEFAULT_TEAM = [
        { name: "Carlos Silva", role: "Master Barber", image: "" },
        { name: "André Santos", role: "Especialista em Barba", image: "" },
        { name: "Lucas Oliveira", role: "Degradê Expert", image: "" }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                onEditAction('init-services__', JSON.stringify(DEFAULT_SERVICES));
            }
        }
    }, [isEditorMode, onEditAction, customization]);

    return (
        <div className="barber-wrapper">

            {/* ============================================================
                NAVBAR
            ============================================================ */}
            <nav className="barber-nav">
                <div className="barber-container barber-nav-inner">
                    <EditableText id="barber_logo" defaultText={d.name} className="barber-logo" tagName="div" {...editProps} />

                    <div className="barber-nav-links hidden md:flex">
                        <a href="#about" className="barber-nav-link">Sobre</a>
                        <a href="#services" className="barber-nav-link">Serviços</a>
                        <a href="#team" className="barber-nav-link">Equipe</a>
                        <a href="#gallery" className="barber-nav-link">Galeria</a>
                        <div className="flex items-center gap-3 ml-4">
                            {user ? (
                                <>
                                    <button onClick={() => setIsClientDashboardOpen(true)} className="barber-nav-link flex items-center gap-1">
                                        <CalendarCheck size={14} /> Minha Área
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsAuthModalOpen(true)} className="barber-nav-link">Entrar</button>
                            )}
                        </div>
                        <button onClick={onBook} className="barber-btn barber-btn-primary ml-4">
                            Agendar
                        </button>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-[var(--barber-dark)] border-t border-gray-800 p-4 flex flex-col gap-4">
                        <a href="#about" onClick={() => setMobileMenuOpen(false)}>Sobre</a>
                        <a href="#services" onClick={() => setMobileMenuOpen(false)}>Serviços</a>
                        <a href="#team" onClick={() => setMobileMenuOpen(false)}>Equipe</a>
                        <button onClick={onBook} className="barber-btn barber-btn-primary w-full">Agendar</button>
                    </div>
                )}
            </nav>

            {/* ============================================================
                HERO SECTION
            ============================================================ */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="barber-hero">
                    <div className="barber-hero-overlay" />
                    <EditableImage
                        editKey="coverImage"
                        currentSrc={heroImage}
                        isEditorMode={isEditorMode}
                        onEditAction={onEditAction}
                        className="barber-hero-bg"
                        label="Alterar Capa"
                        alt="Hero Background"
                    />
                    <div className="barber-container barber-hero-content">
                        <div className="barber-hero-badge">
                            <Scissors size={16} />
                            <EditableText id="barber_badge" defaultText="Desde 2015" tagName="span" {...editProps} />
                        </div>
                        <EditableText id="barber_hero_title" defaultText={d.heroTitle} className="barber-hero-title" tagName="h1" {...editProps} />
                        <EditableText id="barber_hero_sub" defaultText={d.heroSub} className="barber-hero-sub" tagName="p" {...editProps} />
                        <div className="barber-hero-ctas">
                            <button onClick={onBook} className="barber-btn barber-btn-primary barber-btn-lg">
                                <Calendar size={20} /> Agendar Horário
                            </button>
                            <a href="#services" className="barber-btn barber-btn-outline">
                                Ver Serviços
                            </a>
                        </div>
                        <div className="barber-hero-stats">
                            <div className="barber-stat">
                                <span className="barber-stat-value"><EditableText id="barber_stat1_val" defaultText="8+" tagName="span" {...editProps} /></span>
                                <span className="barber-stat-label">Anos de Experiência</span>
                            </div>
                            <div className="barber-stat-divider" />
                            <div className="barber-stat">
                                <span className="barber-stat-value"><EditableText id="barber_stat2_val" defaultText="5k+" tagName="span" {...editProps} /></span>
                                <span className="barber-stat-label">Clientes Satisfeitos</span>
                            </div>
                            <div className="barber-stat-divider" />
                            <div className="barber-stat">
                                <span className="barber-stat-value"><EditableText id="barber_stat3_val" defaultText="4.9" tagName="span" {...editProps} /></span>
                                <span className="barber-stat-label flex items-center gap-1"><Star size={14} className="fill-[var(--barber-gold)]" /> Avaliação</span>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* ============================================================
                ABOUT SECTION
            ============================================================ */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="barber-about">
                    <div className="barber-container barber-about-grid">
                        <div className="barber-about-images">
                            <EditableImage
                                editKey="aboutImage"
                                currentSrc={customization?.aboutImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="barber-about-img-main"
                                label="Foto Principal"
                                alt="Barbearia"
                            />
                            <div className="barber-about-img-accent" />
                        </div>
                        <div className="barber-about-content">
                            <span className="barber-section-label"><EditableText id="barber_abt_pre" defaultText="NOSSA HISTÓRIA" tagName="span" {...editProps} /></span>
                            <EditableText id="barber_abt_title" defaultText={d.aboutTitle} className="barber-section-title" tagName="h2" {...editProps} />
                            <EditableText
                                id="barber_abt_text"
                                defaultText="Nascemos da paixão pelo ofício de barbeiro. Aqui, cada corte é uma obra de arte, cada cliente é tratado como único. Combinamos técnicas tradicionais com as tendências mais modernas para entregar o melhor resultado."
                                className="barber-about-text"
                                tagName="p"
                                {...editProps}
                            />
                            <div className="barber-about-features">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="barber-feature">
                                        <CheckCircle className="text-[var(--barber-gold)]" size={20} />
                                        <EditableText id={`barber_feat_${i}`} defaultText={i === 1 ? "Produtos premium importados" : i === 2 ? "Ambiente exclusivo e climatizado" : "Agendamento online 24h"} tagName="span" {...editProps} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                SERVICES SECTION
            ============================================================ */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="barber-services">
                    <div className="barber-container">
                        <div className="text-center mb-12">
                            <span className="barber-section-label"><EditableText id="barber_srv_pre" defaultText="O QUE OFERECEMOS" tagName="span" {...editProps} /></span>
                            <EditableText id="barber_srv_title" defaultText={d.servicesTitle} className="barber-section-title" tagName="h2" {...editProps} />
                        </div>
                        <div className="barber-services-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                <div key={i} className="barber-service-card group">
                                    <div className="barber-service-icon">
                                        <EditableIcon id={`barber_srv_i${i}`} defaultIcon="Scissors" size={28} {...editProps} />
                                    </div>
                                    <EditableText id={`barber_srv_t${i}`} defaultText={service.title} className="barber-service-title" tagName="h3" {...editProps} />
                                    <EditableText id={`barber_srv_d${i}`} defaultText={service.description} className="barber-service-desc" tagName="p" {...editProps} />
                                    <EditableText id={`barber_srv_p${i}`} defaultText={service.price} className="barber-service-price" tagName="span" {...editProps} />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-red-500/20 p-2 rounded-full text-red-400 hover:bg-red-500/40 transition-colors z-20"
                                            title="Remover"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditorMode && (
                                <button
                                    onClick={() => onEditAction?.('service-add')}
                                    className="barber-service-card barber-add-card"
                                >
                                    <Plus size={32} />
                                    <span>Adicionar Serviço</span>
                                </button>
                            )}
                        </div>
                        <div className="text-center mt-12">
                            <button onClick={onBook} className="barber-btn barber-btn-primary barber-btn-lg">
                                Agendar Agora <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                TEAM SECTION
            ============================================================ */}
            {customization?.visibleSections?.['team'] !== false && (
                <section id="team" className="barber-team">
                    <div className="barber-container">
                        <div className="text-center mb-12">
                            <span className="barber-section-label"><EditableText id="barber_team_pre" defaultText="CONHEÇA" tagName="span" {...editProps} /></span>
                            <EditableText id="barber_team_title" defaultText={d.teamTitle} className="barber-section-title" tagName="h2" {...editProps} />
                        </div>
                        <div className="barber-team-grid">
                            {DEFAULT_TEAM.map((member, i) => (
                                <div key={i} className="barber-team-card">
                                    <div className="barber-team-img">
                                        <EditableImage
                                            editKey={`teamImage__${i}`}
                                            currentSrc={customization?.teamImages?.[i]}
                                            isEditorMode={isEditorMode}
                                            onEditAction={onEditAction}
                                            className="w-full h-full object-cover"
                                            alt={member.name}
                                            renderPlaceholder={() => <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"><UserIcon size={48} className="text-gray-500" /></div>}
                                        />
                                    </div>
                                    <div className="barber-team-info">
                                        <EditableText id={`barber_team_n${i}`} defaultText={member.name} className="barber-team-name" tagName="h3" {...editProps} />
                                        <EditableText id={`barber_team_r${i}`} defaultText={member.role} className="barber-team-role" tagName="span" {...editProps} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                CTA SECTION
            ============================================================ */}
            {customization?.visibleSections?.['contact'] !== false && (
                <section className="barber-cta">
                    <div className="barber-container text-center">
                        <Scissors size={48} className="mx-auto mb-6 text-[var(--barber-gold)]" />
                        <EditableText id="barber_cta_title" defaultText={d.ctaTitle} className="barber-cta-title" tagName="h2" {...editProps} />
                        <EditableText id="barber_cta_sub" defaultText="Agende seu horário e venha viver a experiência Urban Barber." className="barber-cta-sub" tagName="p" {...editProps} />
                        <button onClick={onBook} className="barber-btn barber-btn-gold barber-btn-lg">
                            <Calendar size={20} /> Agendar Horário
                        </button>
                    </div>
                </section>
            )}

            {/* ============================================================
                FOOTER
            ============================================================ */}
            <StandardFooter
                storeName={d.name}
                storeId={store?.id}
                rating={store?.rating}
                totalReviews={store?.totalReviews}
                customization={customization}
                isEditorMode={isEditorMode}
                onEditAction={onEditAction}
            />

            {/* Modals */}
            <PatientAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                storeId={store?.id}
                storeName={d.name}
            />
            {isClientDashboardOpen && (
                <ClientDashboard
                    onClose={() => setIsClientDashboardOpen(false)}
                    storeId={store?.id}
                    storeName={d.name}
                />
            )}
        </div>
    );
};

export default LandingPageBarber;

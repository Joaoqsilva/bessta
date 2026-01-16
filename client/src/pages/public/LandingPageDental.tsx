import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Smile, Star, Shield, Clock, MapPin, Phone,
    ArrowRight, CheckCircle, Calendar, Plus, Trash2, User as UserIcon, LogOut, CalendarCheck, Award
} from 'lucide-react';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { StandardFooter } from '../../components/StandardFooter';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import { PatientAuthModal } from '../../components/auth/PatientAuthModal';
import { ClientDashboard } from '../../components/ClientDashboard';
import { useAuth } from '../../context/AuthContext';
import './LandingPageDental.css';

/* ============================================================
   LAYOUT: DENTAL CLINIC - Design Profissional e Confiável
   ============================================================ */

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageDental = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const d = {
        name: store?.name || "OdontoVida Clínica",
        heroTitle: customization?.welcomeTitle || "Seu sorriso merece o melhor cuidado",
        heroSub: customization?.welcomeMessage || "Tratamentos odontológicos com tecnologia de ponta e uma equipe especializada para cuidar da sua saúde bucal.",
        aboutTitle: "Excelência em Odontologia",
        servicesTitle: "Nossos Tratamentos",
        teamTitle: "Nossa Equipe",
        ctaTitle: "Agende sua consulta",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;

    const DEFAULT_SERVICES = [
        { title: "Limpeza e Profilaxia", description: "Prevenção é o melhor tratamento", price: "R$ 150", icon: "Sparkles" },
        { title: "Clareamento Dental", description: "Dentes brancos e saudáveis", price: "R$ 800", icon: "Sun" },
        { title: "Implantes Dentários", description: "Tecnologia de última geração", price: "Sob consulta", icon: "Settings" },
        { title: "Ortodontia", description: "Aparelhos fixos e invisíveis", price: "Sob consulta", icon: "Smile" },
        { title: "Restaurações", description: "Estética e funcionalidade", price: "R$ 200", icon: "Brush" },
        { title: "Próteses", description: "Soluções personalizadas", price: "Sob consulta", icon: "Crown" }
    ];

    const DEFAULT_TEAM = [
        { name: "Dra. Carolina Mendes", role: "Ortodontista - CRO 12345", speciality: "Especialista em Invisalign" },
        { name: "Dr. Ricardo Alves", role: "Implantodontista - CRO 54321", speciality: "Implantes e Próteses" },
        { name: "Dra. Fernanda Lima", role: "Clínica Geral - CRO 98765", speciality: "Estética Dental" }
    ];

    const DIFFERENTIALS = [
        { icon: "Shield", title: "Biossegurança", desc: "Protocolos rigorosos de higiene" },
        { icon: "Zap", title: "Tecnologia", desc: "Equipamentos de última geração" },
        { icon: "Clock", title: "Pontualidade", desc: "Respeitamos seu tempo" },
        { icon: "CreditCard", title: "Facilidades", desc: "Parcelamos em até 12x" }
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
        <div className="dental-wrapper">

            {/* ============================================================
                NAVBAR
            ============================================================ */}
            <nav className="dental-nav">
                <div className="dental-container dental-nav-inner">
                    <div className="dental-logo-wrapper">
                        <Smile className="dental-logo-icon" size={28} />
                        <EditableText id="dental_logo" defaultText={d.name} className="dental-logo" tagName="div" {...editProps} />
                    </div>

                    <div className="dental-nav-links hidden md:flex">
                        <a href="#about" className="dental-nav-link">Sobre</a>
                        <a href="#services" className="dental-nav-link">Tratamentos</a>
                        <a href="#team" className="dental-nav-link">Equipe</a>
                        <a href="#contact" className="dental-nav-link">Contato</a>
                        <div className="flex items-center gap-3 ml-4">
                            {user ? (
                                <>
                                    <button onClick={() => setIsClientDashboardOpen(true)} className="dental-nav-link flex items-center gap-1">
                                        <CalendarCheck size={14} /> Minha Área
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-500" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsAuthModalOpen(true)} className="dental-nav-link">Entrar</button>
                            )}
                        </div>
                        <button onClick={onBook} className="dental-btn dental-btn-primary ml-4">
                            <Calendar size={16} /> Agendar
                        </button>
                    </div>

                    <button className="md:hidden text-[var(--dental-primary)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-t p-4 flex flex-col gap-4 shadow-lg">
                        <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-gray-600">Sobre</a>
                        <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-gray-600">Tratamentos</a>
                        <a href="#team" onClick={() => setMobileMenuOpen(false)} className="text-gray-600">Equipe</a>
                        <button onClick={onBook} className="dental-btn dental-btn-primary w-full">Agendar</button>
                    </div>
                )}
            </nav>

            {/* ============================================================
                HERO SECTION
            ============================================================ */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="dental-hero">
                    <div className="dental-hero-bg" />
                    <div className="dental-container dental-hero-grid">
                        <div className="dental-hero-content">
                            <div className="dental-hero-badge">
                                <Award size={16} />
                                <EditableText id="dental_badge" defaultText="Clínica de Excelência 2024" tagName="span" {...editProps} />
                            </div>
                            <EditableText id="dental_hero_title" defaultText={d.heroTitle} className="dental-hero-title" tagName="h1" {...editProps} />
                            <EditableText id="dental_hero_sub" defaultText={d.heroSub} className="dental-hero-sub" tagName="p" {...editProps} />
                            <div className="dental-hero-ctas">
                                <button onClick={onBook} className="dental-btn dental-btn-primary dental-btn-lg">
                                    <Calendar size={20} /> Agendar Consulta
                                </button>
                                <a href="tel:+5547991394589" className="dental-btn dental-btn-outline">
                                    <Phone size={20} /> Ligar Agora
                                </a>
                            </div>
                            <div className="dental-hero-trust">
                                <div className="dental-trust-item">
                                    <Shield className="text-[var(--dental-primary)]" size={20} />
                                    <span>Ambiente 100% seguro</span>
                                </div>
                                <div className="dental-trust-item">
                                    <Star className="text-[var(--dental-accent)] fill-current" size={20} />
                                    <span>4.9 no Google</span>
                                </div>
                            </div>
                        </div>
                        <div className="dental-hero-image">
                            <EditableImage
                                editKey="coverImage"
                                currentSrc={heroImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="dental-hero-img"
                                label="Alterar Capa"
                                alt="Hero"
                            />
                            <div className="dental-hero-card">
                                <div className="dental-hero-card-icon">
                                    <Smile size={24} />
                                </div>
                                <div>
                                    <span className="dental-hero-card-value"><EditableText id="dental_card_val" defaultText="+10.000" tagName="span" {...editProps} /></span>
                                    <span className="dental-hero-card-label">Sorrisos Transformados</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* ============================================================
                DIFFERENTIALS SECTION
            ============================================================ */}
            <section className="dental-differentials">
                <div className="dental-container">
                    <div className="dental-diff-grid">
                        {DIFFERENTIALS.map((diff, i) => (
                            <div key={i} className="dental-diff-item">
                                <div className="dental-diff-icon">
                                    <EditableIcon id={`dental_diff_i${i}`} defaultIcon={diff.icon} size={24} {...editProps} />
                                </div>
                                <div>
                                    <EditableText id={`dental_diff_t${i}`} defaultText={diff.title} className="dental-diff-title" tagName="h4" {...editProps} />
                                    <EditableText id={`dental_diff_d${i}`} defaultText={diff.desc} className="dental-diff-desc" tagName="p" {...editProps} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
                ABOUT SECTION
            ============================================================ */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="dental-about">
                    <div className="dental-container dental-about-grid">
                        <div className="dental-about-content">
                            <span className="dental-section-label"><EditableText id="dental_abt_pre" defaultText="QUEM SOMOS" tagName="span" {...editProps} /></span>
                            <EditableText id="dental_abt_title" defaultText={d.aboutTitle} className="dental-section-title" tagName="h2" {...editProps} />
                            <EditableText
                                id="dental_abt_text"
                                defaultText="Há mais de 15 anos cuidando da saúde bucal da nossa comunidade. Nossa clínica combina tecnologia avançada com atendimento humanizado para proporcionar a melhor experiência aos nossos pacientes. Acreditamos que um sorriso saudável transforma vidas."
                                className="dental-about-text"
                                tagName="p"
                                {...editProps}
                            />
                            <div className="dental-about-features">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="dental-feature">
                                        <CheckCircle className="text-[var(--dental-primary)]" size={20} />
                                        <EditableText id={`dental_feat_${i}`} defaultText={i === 1 ? "Profissionais altamente qualificados" : i === 2 ? "Equipamentos de última geração" : "Ambiente acolhedor e moderno"} tagName="span" {...editProps} />
                                    </div>
                                ))}
                            </div>
                            <button onClick={onBook} className="dental-btn dental-btn-primary">
                                Conheça nossa clínica <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="dental-about-images">
                            <EditableImage
                                editKey="aboutImage"
                                currentSrc={customization?.aboutImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="dental-about-img"
                                label="Foto da Clínica"
                                alt="About"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                SERVICES SECTION
            ============================================================ */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="dental-services">
                    <div className="dental-container">
                        <div className="text-center mb-12">
                            <span className="dental-section-label"><EditableText id="dental_srv_pre" defaultText="ESPECIALIDADES" tagName="span" {...editProps} /></span>
                            <EditableText id="dental_srv_title" defaultText={d.servicesTitle} className="dental-section-title" tagName="h2" {...editProps} />
                        </div>
                        <div className="dental-services-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                <div key={i} className="dental-service-card group">
                                    <div className="dental-service-icon">
                                        <EditableIcon id={`dental_srv_i${i}`} defaultIcon={service.icon || "Smile"} size={28} {...editProps} />
                                    </div>
                                    <EditableText id={`dental_srv_t${i}`} defaultText={service.title} className="dental-service-title" tagName="h3" {...editProps} />
                                    <EditableText id={`dental_srv_d${i}`} defaultText={service.description} className="dental-service-desc" tagName="p" {...editProps} />
                                    <div className="dental-service-footer">
                                        <EditableText id={`dental_srv_p${i}`} defaultText={service.price} className="dental-service-price" tagName="span" {...editProps} />
                                        <ArrowRight className="dental-service-arrow" size={20} />
                                    </div>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-red-100 p-2 rounded-full text-red-500 hover:bg-red-200 transition-colors z-20"
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
                                    className="dental-service-card dental-add-card"
                                >
                                    <Plus size={32} />
                                    <span>Adicionar Tratamento</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                TEAM SECTION
            ============================================================ */}
            {customization?.visibleSections?.['team'] !== false && (
                <section id="team" className="dental-team">
                    <div className="dental-container">
                        <div className="text-center mb-12">
                            <span className="dental-section-label"><EditableText id="dental_team_pre" defaultText="PROFISSIONAIS" tagName="span" {...editProps} /></span>
                            <EditableText id="dental_team_title" defaultText={d.teamTitle} className="dental-section-title" tagName="h2" {...editProps} />
                        </div>
                        <div className="dental-team-grid">
                            {DEFAULT_TEAM.map((member, i) => (
                                <div key={i} className="dental-team-card">
                                    <div className="dental-team-img">
                                        <EditableImage
                                            editKey={`teamImage__${i}`}
                                            currentSrc={customization?.teamImages?.[i]}
                                            isEditorMode={isEditorMode}
                                            onEditAction={onEditAction}
                                            className="w-full h-full object-cover"
                                            alt={member.name}
                                            renderPlaceholder={() => <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center"><UserIcon size={48} className="text-[var(--dental-primary)]" /></div>}
                                        />
                                    </div>
                                    <div className="dental-team-info">
                                        <EditableText id={`dental_team_n${i}`} defaultText={member.name} className="dental-team-name" tagName="h3" {...editProps} />
                                        <EditableText id={`dental_team_r${i}`} defaultText={member.role} className="dental-team-role" tagName="span" {...editProps} />
                                        <EditableText id={`dental_team_s${i}`} defaultText={member.speciality} className="dental-team-spec" tagName="p" {...editProps} />
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
                <section id="contact" className="dental-cta">
                    <div className="dental-container">
                        <div className="dental-cta-card">
                            <div className="dental-cta-content">
                                <EditableText id="dental_cta_title" defaultText={d.ctaTitle} className="dental-cta-title" tagName="h2" {...editProps} />
                                <EditableText id="dental_cta_sub" defaultText="Estamos prontos para cuidar do seu sorriso. Entre em contato e agende sua avaliação gratuita." className="dental-cta-sub" tagName="p" {...editProps} />
                            </div>
                            <div className="dental-cta-actions">
                                <button onClick={onBook} className="dental-btn dental-btn-white dental-btn-lg">
                                    <Calendar size={20} /> Agendar Online
                                </button>
                                <a href="https://wa.me/5547991394589" target="_blank" rel="noopener noreferrer" className="dental-btn dental-btn-outline-white dental-btn-lg">
                                    <Phone size={20} /> WhatsApp
                                </a>
                            </div>
                        </div>
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

export default LandingPageDental;

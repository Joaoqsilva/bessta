import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, X, Sparkles, Star, Heart, Clock, MapPin, Phone,
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
import './LandingPageNails.css';

/* ============================================================
   LAYOUT: NAIL SALON - Design Feminino e Elegante
   ============================================================ */

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageNails = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const d = {
        name: store?.name || "Glamour Nails",
        heroTitle: customization?.welcomeTitle || "Unhas que expressam sua personalidade",
        heroSub: customization?.welcomeMessage || "Nail art exclusiva, esmaltação em gel e tratamentos premium para mãos e pés.",
        aboutTitle: "Arte em cada detalhe",
        servicesTitle: "Nossos Serviços",
        galleryTitle: "Nosso Portfólio",
        ctaTitle: "Agende seu momento de beleza",
    };

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || store?.coverImage;

    const DEFAULT_SERVICES = [
        { title: "Esmaltação em Gel", description: "Duração de até 3 semanas com brilho intenso", price: "R$ 80" },
        { title: "Nail Art Designer", description: "Designs exclusivos e personalizados", price: "R$ 120" },
        { title: "Alongamento Fibra", description: "Unhas longas e resistentes", price: "R$ 150" },
        { title: "Spa dos Pés", description: "Hidratação profunda e massagem relaxante", price: "R$ 95" }
    ];

    const DEFAULT_GALLERY = [
        { image: "", title: "Design Floral" },
        { image: "", title: "Francesinha Moderna" },
        { image: "", title: "Nail Art Geométrica" },
        { image: "", title: "Glitter & Glamour" },
        { image: "", title: "Minimalista Chic" },
        { image: "", title: "Tendência da Temporada" }
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
        <div className="nails-wrapper">

            {/* ============================================================
                NAVBAR
            ============================================================ */}
            <nav className="nails-nav">
                <div className="nails-container nails-nav-inner">
                    <EditableText id="nails_logo" defaultText={d.name} className="nails-logo" tagName="div" {...editProps} />

                    <div className="nails-nav-links hidden md:flex">
                        <a href="#about" className="nails-nav-link">Sobre</a>
                        <a href="#services" className="nails-nav-link">Serviços</a>
                        <a href="#gallery" className="nails-nav-link">Galeria</a>
                        <a href="#contact" className="nails-nav-link">Contato</a>
                        <div className="flex items-center gap-3 ml-4">
                            {user ? (
                                <>
                                    <button onClick={() => setIsClientDashboardOpen(true)} className="nails-nav-link flex items-center gap-1">
                                        <CalendarCheck size={14} /> Minha Área
                                    </button>
                                    <button onClick={logout} className="text-gray-400 hover:text-red-400" title="Sair">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsAuthModalOpen(true)} className="nails-nav-link">Entrar</button>
                            )}
                        </div>
                        <button onClick={onBook} className="nails-btn nails-btn-primary ml-4">
                            <Sparkles size={16} /> Agendar
                        </button>
                    </div>

                    <button className="md:hidden text-[var(--nails-primary)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-t p-4 flex flex-col gap-4 shadow-lg">
                        <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-gray-600">Sobre</a>
                        <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-gray-600">Serviços</a>
                        <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="text-gray-600">Galeria</a>
                        <button onClick={onBook} className="nails-btn nails-btn-primary w-full">Agendar</button>
                    </div>
                )}
            </nav>

            {/* ============================================================
                HERO SECTION
            ============================================================ */}
            {customization?.visibleSections?.['hero'] !== false && (
                <header className="nails-hero">
                    <div className="nails-hero-bg-pattern" />
                    <div className="nails-container nails-hero-grid">
                        <div className="nails-hero-content">
                            <div className="nails-hero-badge">
                                <Sparkles size={16} />
                                <EditableText id="nails_badge" defaultText="Premium Nail Studio" tagName="span" {...editProps} />
                            </div>
                            <EditableText id="nails_hero_title" defaultText={d.heroTitle} className="nails-hero-title" tagName="h1" {...editProps} />
                            <EditableText id="nails_hero_sub" defaultText={d.heroSub} className="nails-hero-sub" tagName="p" {...editProps} />
                            <div className="nails-hero-ctas">
                                <button onClick={onBook} className="nails-btn nails-btn-primary nails-btn-lg">
                                    <Calendar size={20} /> Agendar Horário
                                </button>
                                <a href="#gallery" className="nails-btn nails-btn-outline">
                                    Ver Trabalhos
                                </a>
                            </div>
                            <div className="nails-hero-trust">
                                <div className="nails-trust-avatars">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="nails-trust-avatar">
                                            <Heart size={12} />
                                        </div>
                                    ))}
                                </div>
                                <div className="nails-trust-text">
                                    <span className="nails-trust-strong">+500 clientes</span>
                                    <span className="nails-trust-sub">nos amam ❤️</span>
                                </div>
                            </div>
                        </div>
                        <div className="nails-hero-image">
                            <div className="nails-hero-img-wrapper">
                                <EditableImage
                                    editKey="coverImage"
                                    currentSrc={heroImage}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="nails-hero-img"
                                    label="Alterar Capa"
                                    alt="Hero"
                                />
                                <div className="nails-hero-img-accent" />
                                <div className="nails-hero-img-dots" />
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* ============================================================
                ABOUT SECTION
            ============================================================ */}
            {customization?.visibleSections?.['about'] !== false && (
                <section id="about" className="nails-about">
                    <div className="nails-container">
                        <div className="nails-about-grid">
                            <div className="nails-about-images">
                                <EditableImage
                                    editKey="aboutImage"
                                    currentSrc={customization?.aboutImage}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="nails-about-img"
                                    label="Foto do Estúdio"
                                    alt="About"
                                />
                            </div>
                            <div className="nails-about-content">
                                <span className="nails-section-label"><EditableText id="nails_abt_pre" defaultText="SOBRE NÓS" tagName="span" {...editProps} /></span>
                                <EditableText id="nails_abt_title" defaultText={d.aboutTitle} className="nails-section-title" tagName="h2" {...editProps} />
                                <EditableText
                                    id="nails_abt_text"
                                    defaultText="Somos apaixonadas por nail art! Nosso espaço foi criado para que você viva uma experiência única de autocuidado. Utilizamos apenas produtos de alta qualidade e técnicas modernas para garantir unhas lindas e saudáveis."
                                    className="nails-about-text"
                                    tagName="p"
                                    {...editProps}
                                />
                                <div className="nails-about-stats">
                                    <div className="nails-mini-stat">
                                        <span className="nails-mini-stat-value"><EditableText id="nails_stat1" defaultText="5+" tagName="span" {...editProps} /></span>
                                        <span className="nails-mini-stat-label">Anos de Experiência</span>
                                    </div>
                                    <div className="nails-mini-stat">
                                        <span className="nails-mini-stat-value"><EditableText id="nails_stat2" defaultText="2k+" tagName="span" {...editProps} /></span>
                                        <span className="nails-mini-stat-label">Clientes Felizes</span>
                                    </div>
                                    <div className="nails-mini-stat">
                                        <span className="nails-mini-stat-value"><EditableText id="nails_stat3" defaultText="100%" tagName="span" {...editProps} /></span>
                                        <span className="nails-mini-stat-label">Produtos Premium</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                SERVICES SECTION
            ============================================================ */}
            {customization?.visibleSections?.['services'] !== false && (
                <section id="services" className="nails-services">
                    <div className="nails-container">
                        <div className="text-center mb-12">
                            <span className="nails-section-label"><EditableText id="nails_srv_pre" defaultText="O QUE OFERECEMOS" tagName="span" {...editProps} /></span>
                            <EditableText id="nails_srv_title" defaultText={d.servicesTitle} className="nails-section-title" tagName="h2" {...editProps} />
                        </div>
                        <div className="nails-services-grid">
                            {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : DEFAULT_SERVICES).map((service: any, i: number) => (
                                <div key={i} className="nails-service-card group">
                                    <div className="nails-service-icon">
                                        <EditableIcon id={`nails_srv_i${i}`} defaultIcon={i === 0 ? "Sparkles" : i === 1 ? "Heart" : i === 2 ? "Star" : "Flower2"} size={28} {...editProps} />
                                    </div>
                                    <EditableText id={`nails_srv_t${i}`} defaultText={service.title} className="nails-service-title" tagName="h3" {...editProps} />
                                    <EditableText id={`nails_srv_d${i}`} defaultText={service.description} className="nails-service-desc" tagName="p" {...editProps} />
                                    <div className="nails-service-footer">
                                        <EditableText id={`nails_srv_p${i}`} defaultText={service.price} className="nails-service-price" tagName="span" {...editProps} />
                                        <button onClick={onBook} className="nails-service-btn">Agendar</button>
                                    </div>
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + i); }}
                                            className="absolute top-2 right-2 bg-pink-100 p-2 rounded-full text-pink-500 hover:bg-pink-200 transition-colors z-20"
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
                                    className="nails-service-card nails-add-card"
                                >
                                    <Plus size={32} />
                                    <span>Adicionar Serviço</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
                GALLERY SECTION
            ============================================================ */}
            {customization?.visibleSections?.['gallery'] !== false && (
                <section id="gallery" className="nails-gallery">
                    <div className="nails-container">
                        <div className="text-center mb-12">
                            <span className="nails-section-label"><EditableText id="nails_gal_pre" defaultText="INSPIRAÇÃO" tagName="span" {...editProps} /></span>
                            <EditableText id="nails_gal_title" defaultText={d.galleryTitle} className="nails-section-title" tagName="h2" {...editProps} />
                        </div>
                        <div className="nails-gallery-grid">
                            {DEFAULT_GALLERY.slice(0, 6).map((item, i) => (
                                <div key={i} className="nails-gallery-item">
                                    <EditableImage
                                        editKey={`galleryImage__${i}`}
                                        currentSrc={customization?.galleryImages?.[i]}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="nails-gallery-img"
                                        alt={item.title}
                                        renderPlaceholder={() => (
                                            <div className="nails-gallery-placeholder">
                                                <Sparkles size={32} />
                                                <EditableText id={`nails_gal_t${i}`} defaultText={item.title} tagName="span" {...editProps} />
                                            </div>
                                        )}
                                    />
                                    <div className="nails-gallery-overlay">
                                        <Heart className="text-white" size={24} />
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
                <section id="contact" className="nails-cta">
                    <div className="nails-container text-center">
                        <Sparkles size={48} className="mx-auto mb-6 text-white" />
                        <EditableText id="nails_cta_title" defaultText={d.ctaTitle} className="nails-cta-title" tagName="h2" {...editProps} />
                        <EditableText id="nails_cta_sub" defaultText="Reserve seu horário e venha se sentir ainda mais linda!" className="nails-cta-sub" tagName="p" {...editProps} />
                        <button onClick={onBook} className="nails-btn nails-btn-white nails-btn-lg">
                            <Calendar size={20} /> Agendar Agora
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

export default LandingPageNails;

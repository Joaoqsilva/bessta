import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import type { StoreCustomization } from '../../context/StoreCustomizationService';
import './LandingPageBeautySalon.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

// ... (imports remain)

export const LandingPageBeautySalon = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {

    const d = {
        name: store?.name || "Beleza & Estilo",
        heroSubtitle: "Salão de Beleza Premium",
        heroTitle: customization?.welcomeTitle || "Realce sua\nbeleza natural",
        heroDesc: customization?.welcomeMessage || "Experimente tratamentos exclusivos com profissionais especializados. Nosso objetivo é fazer você se sentir incrível.",
        ctaPrimary: "Agendar Horário",
        ctaSecondary: "Ver Serviços",

        servicesSubtitle: "Nossos Serviços",
        servicesTitle: "Tratamentos Exclusivos",

        aboutSubtitle: "Sobre Nós",
        aboutTitle: customization?.aboutTitle || "Mais de 10 anos transformando vidas",
        aboutText: customization?.aboutText || "Somos especializados em revelar a melhor versão de cada cliente. Com técnicas inovadoras e produtos premium, oferecemos uma experiência única de cuidado e bem-estar.",

        ctaTitle: "Pronta para se transformar?",
        ctaDesc: "Agende seu horário e descubra a diferença.",

        footerDesc: "Transformando beleza em arte desde 2012."
    };

    const services = [
        { iconName: 'Scissors', title: "Corte & Styling", desc: "Cortes modernos e clássicos com acabamento impecável", price: "A partir de R$ 80" },
        { iconName: 'Palette', title: "Coloração", desc: "Mechas, luzes e coloração total com produtos premium", price: "A partir de R$ 150" },
        { iconName: 'Sparkles', title: "Tratamentos", desc: "Hidratação, reconstrução e tratamentos especiais", price: "A partir de R$ 100" },
        { iconName: 'Droplet', title: "Manicure & Pedicure", desc: "Unhas perfeitas com esmaltação duradoura", price: "A partir de R$ 50" }
    ];

    const testimonials = [
        { name: "Ana Souza", text: "Melhor experiência que já tive! O ambiente é incrível e saí de lá me sentindo renovada." },
        { name: "Carla Dias", text: "Profissionais extremamente qualificados. Amei meu novo corte e a cor ficou perfeita." },
        { name: "Julia Lima", text: "Atendimento impecável desde a recepção. Recomendo de olhos fechados!" }
    ];

    const galleryImages = customization?.galleryImages || [];
    const primaryColor = customization?.primaryColor || '#c9a87c';
    const accentColor = customization?.accentColor || '#e8b4b8';

    // In new design we rely less on custom footer colors and more on the clean white theme, 
    // but we can map them if user customized.
    const heroImage = customization?.coverImage;
    const aboutImage = customization?.aboutImage;

    const dynamicStyle = {
        '--beauty-primary': primaryColor,
        '--beauty-accent': accentColor,
    } as React.CSSProperties;

    const editProps = { isEditorMode, onEditAction, customization };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="beauty-wrapper" style={dynamicStyle}>
            {/* Navbar */}
            <nav className="beauty-nav">
                <div className="beauty-container beauty-nav-inner">
                    <EditableText id="beauty_name" defaultText={d.name} className="beauty-logo" tagName="div" {...editProps} />
                    <div className="beauty-nav-links">
                        <a href="#services" className="beauty-nav-link">Serviços</a>
                        <a href="#about" className="beauty-nav-link">Sobre</a>
                        <a href="#contact" className="beauty-nav-link">Contato</a>
                        <Link to={store ? `/store/${store.slug}` : "/store/demo"} onClick={onBook} className="beauty-nav-cta">
                            Agendar
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="beauty-hero">
                <div className="beauty-container">
                    <div className="beauty-hero-grid">
                        <div>
                            <div className="beauty-hero-subtitle">
                                <EditableText id="beauty_hero_sub" defaultText={d.heroSubtitle} tagName="span" {...editProps} />
                            </div>
                            <EditableText id="beauty_hero_title" defaultText={d.heroTitle} className="beauty-hero-title" tagName="h1" {...editProps} />
                            <EditableText id="beauty_hero_desc" defaultText={d.heroDesc} className="beauty-hero-desc" tagName="p" {...editProps} />

                            <div className="flex gap-4 flex-wrap">
                                <Link to={store ? `/store/${store.slug}` : "/store/demo"} onClick={onBook} className="beauty-btn beauty-btn-primary">
                                    <EditableText id="beauty_cta_primary" defaultText={d.ctaPrimary} tagName="span" {...editProps} />
                                    <ArrowRight size={16} />
                                </Link>
                                <a href="#services" className="beauty-btn beauty-btn-outline">
                                    <EditableText id="beauty_cta_secondary" defaultText={d.ctaSecondary} tagName="span" {...editProps} />
                                </a>
                            </div>
                        </div>

                        <div className="beauty-hero-image relative group">
                            <EditOverlay label="Alterar Capa" action="cover-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            {heroImage ? (
                                <img src={heroImage} alt={d.name} className="beauty-hero-img" />
                            ) : (
                                <div className="beauty-hero-img bg-gradient-to-br from-[#fdf8f5] to-[#e8b4b8] flex items-center justify-center">
                                    <EditableIcon id="beauty_hero_icon" defaultIcon="Sparkles" size={80} className="text-[#c9a87c]/50" customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Services */}
            <section className="beauty-services" id="services">
                <div className="beauty-container">
                    <div className="beauty-section-header">
                        <EditableText id="beauty_svc_sub" defaultText={d.servicesSubtitle} className="beauty-section-subtitle" tagName="div" {...editProps} />
                        <EditableText id="beauty_svc_title" defaultText={d.servicesTitle} className="beauty-section-title" tagName="h2" {...editProps} />
                    </div>

                    <div className="beauty-services-grid">
                        {services.map((service, idx) => (
                            <div key={idx} className="beauty-service-card">
                                <div className="beauty-service-icon">
                                    <EditableIcon
                                        id={`beauty_svc_icon_${idx}`}
                                        defaultIcon={service.iconName}
                                        size={30}
                                        customization={customization}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                    />
                                </div>
                                <EditableText id={`beauty_svc_title_${idx}`} defaultText={service.title} className="beauty-service-title" tagName="h3" {...editProps} />
                                <EditableText id={`beauty_svc_desc_${idx}`} defaultText={service.desc} className="beauty-service-desc" tagName="p" {...editProps} />
                                <div className="beauty-service-price">
                                    <EditableText id={`beauty_svc_price_${idx}`} defaultText={service.price} tagName="span" {...editProps} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            {galleryImages.length > 0 && (
                <section className="beauty-gallery">
                    <div className="beauty-container">
                        <div className="text-center mb-12 relative group">
                            <EditOverlay label="Gerenciar Galeria" action="gallery" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            <EditableText id="beauty_gal_title" defaultText="Nossos Resultados" className="beauty-section-title" tagName="h2" {...editProps} />
                        </div>
                        <div className="beauty-gallery-grid">
                            {galleryImages.slice(0, 4).map((img: string, idx: number) => (
                                <div key={idx} className="beauty-gallery-item">
                                    <img src={img} alt={`Gallery ${idx + 1}`} className="beauty-gallery-img" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* About */}
            <section className="beauty-about" id="about">
                <div className="beauty-container">
                    <div className="beauty-about-grid">
                        <div className="beauty-about-image relative group">
                            <EditOverlay label="Alterar Imagem" action="about-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            {aboutImage ? (
                                <img src={aboutImage} alt="Sobre" className="beauty-about-img" />
                            ) : (
                                <div className="beauty-about-img bg-gradient-to-br from-[#fdf8f5] to-[#e8b4b8] flex items-center justify-center">
                                    <EditableIcon id="beauty_about_icon" defaultIcon="Heart" size={80} className="text-[#c9a87c]/50" customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="beauty-section-subtitle">
                                <EditableText id="beauty_about_sub" defaultText={d.aboutSubtitle} tagName="span" {...editProps} />
                            </div>
                            <EditableText id="beauty_about_title" defaultText={d.aboutTitle} className="beauty-section-title mb-6" tagName="h2" {...editProps} />
                            <EditableText id="beauty_about_text" defaultText={d.aboutText} className="text-gray-600 leading-relaxed mb-8 text-lg" tagName="p" {...editProps} />
                            <Link to={store ? `/store/${store.slug}` : "/store/demo"} onClick={onBook} className="beauty-btn beauty-btn-primary">
                                Agendar Visita
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            {/* Stats Section (New) */}
            <section className="py-20 bg-[var(--beauty-primary)] text-white">
                <div className="beauty-container beauty-stats-grid">
                    <div>
                        <EditableText id="beauty_stat_1_num" defaultText="10+" className="text-4xl font-bold mb-2 block font-serif" tagName="span" {...editProps} />
                        <EditableText id="beauty_stat_1_txt" defaultText="Anos de História" className="text-sm uppercase tracking-wider opacity-80" tagName="div" {...editProps} />
                    </div>
                    <div>
                        <EditableText id="beauty_stat_2_num" defaultText="5k+" className="text-4xl font-bold mb-2 block font-serif" tagName="span" {...editProps} />
                        <EditableText id="beauty_stat_2_txt" defaultText="Clientes Felizes" className="text-sm uppercase tracking-wider opacity-80" tagName="div" {...editProps} />
                    </div>
                    <div>
                        <EditableText id="beauty_stat_3_num" defaultText="50+" className="text-4xl font-bold mb-2 block font-serif" tagName="span" {...editProps} />
                        <EditableText id="beauty_stat_3_txt" defaultText="Especialistas" className="text-sm uppercase tracking-wider opacity-80" tagName="div" {...editProps} />
                    </div>
                    <div>
                        <EditableText id="beauty_stat_4_num" defaultText="15+" className="text-4xl font-bold mb-2 block font-serif" tagName="span" {...editProps} />
                        <EditableText id="beauty_stat_4_txt" defaultText="Prêmios" className="text-sm uppercase tracking-wider opacity-80" tagName="div" {...editProps} />
                    </div>
                </div>
            </section>

            <section className="beauty-testimonials">
                <div className="beauty-container">
                    <div className="beauty-section-header">
                        <EditableText id="beauty_test_sub" defaultText="Depoimentos" className="beauty-section-subtitle" tagName="div" {...editProps} />
                        <EditableText id="beauty_test_title" defaultText="O que dizem nossas clientes" className="beauty-section-title" tagName="h2" {...editProps} />
                    </div>
                    <div className="beauty-testimonials-grid">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <div className="flex gap-1 text-yellow-400 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Sparkles key={s} size={14} fill="currentColor" />)}
                                </div>
                                <EditableText id={`beauty_test_txt_${i}`} defaultText={`"${t.text}"`} className="text-gray-600 italic mb-4 block leading-relaxed" tagName="p" {...editProps} />
                                <EditableText id={`beauty_test_author_${i}`} defaultText={t.name} className="font-bold text-[var(--beauty-primary)]" tagName="span" {...editProps} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="beauty-cta" id="contact">
                <div className="beauty-cta-bg"></div>
                <div className="beauty-container beauty-cta-content relative">
                    <EditableText id="beauty_cta_title" defaultText={d.ctaTitle} className="beauty-cta-title" tagName="h2" {...editProps} />
                    <EditableText id="beauty_cta_desc" defaultText={d.ctaDesc} className="beauty-cta-desc" tagName="p" {...editProps} />
                    <Link to={store ? `/store/${store.slug}` : "/store/demo"} onClick={onBook} className="beauty-btn beauty-btn-primary">
                        Agendar Agora
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="beauty-footer">
                <div className="beauty-container">
                    <div className="beauty-footer-grid">
                        <div>
                            <EditableText id="beauty_footer_brand" defaultText={d.name} className="beauty-footer-brand" tagName="div" {...editProps} />
                            <EditableText id="beauty_footer_desc" defaultText={d.footerDesc} className="beauty-footer-desc" tagName="p" {...editProps} />
                        </div>
                        <div>
                            <h4 className="beauty-footer-title">Links</h4>
                            <a href="#services" className="beauty-footer-link">Serviços</a>
                            <a href="#about" className="beauty-footer-link">Sobre Nós</a>
                            <Link to={store ? `/store/${store.slug}` : "/store/demo"} onClick={onBook} className="beauty-footer-link">Agendar</Link>
                        </div>
                        <div>
                            <h4 className="beauty-footer-title">Contato</h4>
                            <EditableText id="beauty_footer_phone" defaultText="(11) 99999-9999" className="beauty-footer-link" tagName="div" {...editProps} />
                            <EditableText id="beauty_footer_email" defaultText="contato@beleza.com" className="beauty-footer-link" tagName="div" {...editProps} />
                        </div>
                        <div>
                            <h4 className="beauty-footer-title">Horários</h4>
                            <p className="beauty-footer-link">Seg - Sex: 9h - 20h</p>
                            <p className="beauty-footer-link">Sáb: 9h - 18h</p>
                        </div>
                    </div>

                    <div className="beauty-footer-bottom">
                        © {new Date().getFullYear()} <EditableText id="beauty_copy" defaultText={d.name} tagName="span" {...editProps} /> - Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
};

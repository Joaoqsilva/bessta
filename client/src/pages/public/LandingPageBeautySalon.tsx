import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Trash2, Plus, Star, User } from 'lucide-react';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { StoreFooterRating } from '../../components/StoreFooterRating';
import { EditableImage } from '../../components/EditableImage';
import { EditableSocialLink } from '../../components/EditableSocialLink';
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
        { author: "Ana Souza", text: "Melhor experiência que já tive! O ambiente é incrível e saí de lá me sentindo renovada." },
        { author: "Carla Dias", text: "Profissionais extremamente qualificados. Amei meu novo corte e a cor ficou perfeita." },
        { author: "Julia Lima", text: "Atendimento impecável desde a recepção. Recomendo de olhos fechados!" }
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

        // Auto-populate defaults in Editor Mode if empty
        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                const defaultServices = services.map((s, i) => ({
                    id: `def_${i}`,
                    title: s.title,
                    description: s.desc,
                    price: s.price,
                    icon: s.iconName
                }));
                onEditAction('init-services__', JSON.stringify(defaultServices));
            }
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                const defaultTestimonials = {
                    testimonials: testimonials.map((t, i) => ({ text: t.text, author: t.author, role: 'Cliente', rating: 5, id: i.toString() })),
                    images: ["", "", ""]
                };
                onEditAction('init-testimonials__', JSON.stringify(defaultTestimonials));
            }
            if (!customization?.team || customization.team.length === 0) {
                const defaultTeam = {
                    team: [
                        { id: '1', name: 'Juliana', role: 'Hair Stylist', bio: 'Especialista em colorimetria.' },
                        { id: '2', name: 'Carla', role: 'Manicure', bio: 'Unhas artísticas e spa.' },
                        { id: '3', name: 'Fernanda', role: 'Esteticista', bio: 'Tratamentos faciais avançados.' }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-team__', JSON.stringify(defaultTeam));
            }
        }
    }, [isEditorMode]);



    return (
        <div className="beauty-wrapper" style={dynamicStyle}>
            {/* Navbar */}
            <nav className="beauty-nav">
                <div className="beauty-container beauty-nav-inner">
                    <EditableText id="beauty_name" defaultText={d.name} className="beauty-logo" tagName="div" {...editProps} />
                    <div className="beauty-nav-links">
                        <a href="#services" className="beauty-nav-link"><EditableText id="beauty_nav_1" defaultText="Serviços" tagName="span" {...editProps} /></a>
                        <a href="#about" className="beauty-nav-link"><EditableText id="beauty_nav_2" defaultText="Sobre" tagName="span" {...editProps} /></a>
                        <a href="#contact" className="beauty-nav-link"><EditableText id="beauty_nav_3" defaultText="Contato" tagName="span" {...editProps} /></a>

                        <Link to={store ? `/${store.slug}` : "/demo"} onClick={onBook} className="beauty-nav-cta">
                            <EditableText id="beauty_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
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
                                <Link to={store ? `/${store.slug}` : "/demo"} onClick={onBook} className="beauty-btn beauty-btn-primary">
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
                        {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : services).map((service: any, idx) => (
                            <div key={idx} className="beauty-service-card">
                                <div className="beauty-service-icon">
                                    <EditableIcon
                                        id={`beauty_svc_icon_${idx}`}
                                        defaultIcon={service.iconName || 'Sparkles'}
                                        size={30}
                                        customization={customization}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                    />
                                </div>
                                <EditableText id={`beauty_svc_title_${idx}`} defaultText={service.title} className="beauty-service-title" tagName="h3" {...editProps} />
                                <EditableText id={`beauty_svc_desc_${idx}`} defaultText={service.description || service.desc} className="beauty-service-desc" tagName="p" {...editProps} />
                                <div className="beauty-service-price">
                                    <EditableText id={`beauty_svc_price_${idx}`} defaultText={service.price || 'Consulte'} tagName="span" {...editProps} />
                                </div>
                                {isEditorMode && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + idx); }}
                                        className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                                className="beauty-service-card border-2 border-dashed border-[#c9a87c]/30 hover:bg-[#fdf8f5] flex flex-col items-center justify-center cursor-pointer min-h-[250px] transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#fdf8f5] group-hover:bg-[#c9a87c]/20 flex items-center justify-center mb-4 text-[#c9a87c]">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-[#c9a87c] text-lg">Adicionar Serviço</span>
                            </button>
                        )}
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
                                <div key={idx} className="beauty-gallery-item relative group">
                                    <img src={img} alt={`Gallery ${idx + 1}`} className="beauty-gallery-img" />
                                    {isEditorMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditAction?.('gallery-remove__' + idx); }}
                                            className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            title="Remover Imagem"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
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
                            <Link to={store ? `/${store.slug}` : "/demo"} onClick={onBook} className="beauty-btn beauty-btn-primary">
                                Agendar Visita
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="beauty-services" id="team" style={{ background: 'white' }}>
                <div className="beauty-container">
                    <div className="beauty-section-header">
                        <EditableText id="beauty_team_sub" defaultText="Nossa Equipe" className="beauty-section-subtitle" tagName="div" {...editProps} />
                        <EditableText id="beauty_team_title" defaultText="Especialistas em Beleza" className="beauty-section-title" tagName="h2" {...editProps} />
                    </div>
                    <div className="beauty-services-grid">
                        {(customization?.team && customization.team.length > 0 ? customization.team : customization?.teamImages?.length ? [] : [
                            { name: 'Juliana', role: 'Hair Stylist', bio: 'Especialista em colorimetria.' }
                        ]).map((member: any, i: number) => (
                            <div key={i} className="beauty-service-card relative group p-0 overflow-hidden">
                                <div className="h-64 bg-[#fdf8f5] relative">
                                    <EditableImage
                                        editKey={`teamImages__${i}`}
                                        currentSrc={customization?.teamImages?.[i]}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover"
                                        alt={member.name}
                                        renderPlaceholder={() => (
                                            <div className="w-full h-full flex items-center justify-center text-[#c9a87c]/30">
                                                <EditableIcon id={`beauty_team_ph_${i}`} defaultIcon="User" size={48} {...editProps} />
                                            </div>
                                        )}
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <EditableText id={`beauty_team_n${i}`} defaultText={member.name || 'Nome'} className="font-bold text-xl mb-1 block text-[#c9a87c]" tagName="h3" {...editProps} />
                                    <EditableText id={`beauty_team_r${i}`} defaultText={member.role || 'Cargo'} className="text-gray-500 text-sm mb-4 block font-medium uppercase tracking-wider" tagName="span" {...editProps} />
                                    <EditableText id={`beauty_team_b${i}`} defaultText={member.bio || 'Bio'} className="text-gray-500 text-sm leading-relaxed" tagName="p" {...editProps} />
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
                                className="beauty-service-card border-2 border-dashed border-[#c9a87c]/30 hover:bg-[#fdf8f5] flex flex-col items-center justify-center cursor-pointer min-h-[300px] transition-colors group"
                            >
                                <Plus size={24} className="text-[#c9a87c] mb-2" />
                                <span className="font-bold text-[#c9a87c]">Adicionar Membro</span>
                            </button>
                        )}
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
                        {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : testimonials).map((t: any, i: number) => (
                            <div key={i} className="testimonial-card relative group">
                                <div className="flex gap-1 text-[#c9a87c] mb-4">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            size={14}
                                            fill={s <= (t.rating || 5) ? "currentColor" : "none"}
                                            className={`cursor-pointer ${s <= (t.rating || 5) ? '' : 'text-gray-300'}`}
                                            onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                        />
                                    ))}
                                </div>
                                <div className="mb-4">
                                    <EditableText id={`beauty_test_txt_${i}`} defaultText={`"${t.text}"`} className="text-gray-600 italic block leading-relaxed" tagName="p" {...editProps} />
                                </div>
                                <div className="flex items-center gap-4 mt-4 border-t border-[#e8b4b8]/20 pt-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#fdf8f5] relative shrink-0">
                                        <EditableImage
                                            editKey={`testimonialImages__${i}`}
                                            currentSrc={customization?.testimonialImages?.[i]}
                                            isEditorMode={isEditorMode}
                                            onEditAction={onEditAction}
                                            className="w-full h-full object-cover"
                                            alt={t.author}
                                            renderPlaceholder={() => (
                                                <div className="w-full h-full bg-[#c9a87c] text-white flex items-center justify-center font-bold text-xs">
                                                    {t.author.charAt(0)}
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <EditableText id={`beauty_test_author_${i}`} defaultText={t.author} className="font-bold text-[var(--beauty-primary)] block text-sm" tagName="span" {...editProps} />
                                        <EditableText id={`beauty_test_role_${i}`} defaultText={t.role || 'Cliente'} className="text-xs text-gray-500 block" tagName="span" {...editProps} />
                                    </div>
                                </div>
                                {isEditorMode && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEditAction?.('testimonial-remove__' + i); }}
                                        className="absolute top-2 right-2 bg-red-50 p-1 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {isEditorMode && (
                            <button
                                onClick={() => onEditAction?.('testimonial-add')}
                                className="testimonial-card border-2 border-dashed border-[#c9a87c]/30 hover:bg-[#fdf8f5] flex flex-col items-center justify-center cursor-pointer transition-colors group min-h-[200px]"
                            >
                                <Plus size={24} className="text-[#c9a87c] mb-2" />
                                <span className="font-bold text-[#c9a87c]">Adicionar Depoimento</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="beauty-cta" id="contact">
                <div className="beauty-cta-bg"></div>
                <div className="beauty-container beauty-cta-content relative">
                    <EditableText id="beauty_cta_title" defaultText={d.ctaTitle} className="beauty-cta-title" tagName="h2" {...editProps} />
                    <EditableText id="beauty_cta_desc" defaultText={d.ctaDesc} className="beauty-cta-desc" tagName="p" {...editProps} />
                    <Link to={store ? `/${store.slug}` : "/demo"} onClick={onBook} className="beauty-btn beauty-btn-primary">
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
                            <h4 className="beauty-footer-title"><EditableText id="beauty_ft_title_1" defaultText="Links" tagName="span" {...editProps} /></h4>
                            <a href="#services" className="beauty-footer-link"><EditableText id="beauty_ft_link_1" defaultText="Serviços" tagName="span" {...editProps} /></a>
                            <a href="#about" className="beauty-footer-link"><EditableText id="beauty_ft_link_2" defaultText="Sobre Nós" tagName="span" {...editProps} /></a>
                            <Link to={store ? `/${store.slug}` : "/demo"} onClick={onBook} className="beauty-footer-link"><EditableText id="beauty_ft_link_3" defaultText="Agendar" tagName="span" {...editProps} /></Link>
                        </div>
                        <div>
                            <h4 className="beauty-footer-title"><EditableText id="beauty_ft_title_2" defaultText="Contato" tagName="span" {...editProps} /></h4>
                            <EditableText id="beauty_footer_phone" defaultText="(11) 99999-9999" className="beauty-footer-link" tagName="div" {...editProps} />
                            <EditableText id="beauty_footer_email" defaultText="contato@beleza.com" className="beauty-footer-link" tagName="div" {...editProps} />
                        </div>
                        <div>
                            <h4 className="beauty-footer-title"><EditableText id="beauty_ft_title_3" defaultText="Horários" tagName="span" {...editProps} /></h4>
                            <p className="beauty-footer-link"><EditableText id="beauty_ft_h_1" defaultText="Seg - Sex: 9h - 20h" tagName="span" {...editProps} /></p>
                            <p className="beauty-footer-link"><EditableText id="beauty_ft_h_2" defaultText="Sáb: 9h - 18h" tagName="span" {...editProps} /></p>
                        </div>
                    </div>

                    <div className="beauty-footer-bottom flex flex-col items-center gap-4">
                        <p>© {new Date().getFullYear()} <EditableText id="beauty_copy" defaultText={d.name} tagName="span" {...editProps} /> - <EditableText id="beauty_rights" defaultText="Todos os direitos reservados." tagName="span" {...editProps} /></p>
                        <div className="flex gap-4">
                            <EditableSocialLink
                                id="beauty_social"
                                links={customization?.socialLinks || []}
                                isEditorMode={isEditorMode}
                                onUpdateLinks={(links) => onEditAction?.('socialLinks', JSON.stringify(links))}
                                iconSize={20}
                                iconClassName="text-pink-200 hover:text-white transition-colors cursor-pointer"
                            />
                        </div>
                        <StoreFooterRating
                            storeId={store?.id || 'demo'}
                            rating={store?.rating}
                            totalReviews={store?.totalReviews}
                            color="#ec4899"
                            isEditorMode={isEditorMode}
                            textColor="#fbcfe8"
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
};

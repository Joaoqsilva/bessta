import { useEffect, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import './LandingPageModern.css';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { StarRating } from '../../components/StarRating';
import type { StoreCustomization } from '../../context/StoreCustomizationService';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageModern = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {

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

    const faqs = [
        { q: "O que é psicanálise lacaniana?", a: "É uma orientação clínica baseada no ensino de Jacques Lacan, focada na ética do desejo e na estrutura da linguagem do inconsciente." },
        { q: "Qual a duração das sessões?", a: "Na psicanálise lacaniana, usamos o tempo lógico. As sessões variam conforme o momento do discurso do analisante (corte)." },
        { q: "Atende online?", a: "Sim, o atendimento online sustenta o dispositivo analítico através da voz e da presença virtual." }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                        <a href="#faq"><EditableText id="mod_nav_faq" defaultText="Dúvidas" tagName="span" {...editProps} /></a>
                        <button onClick={onBook} className="ml-8 modern-btn modern-btn-primary">
                            <EditableText id="mod_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
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
                        <EditOverlay label="Alterar Capa" action="cover-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                        {heroImage ? (
                            <img src={heroImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 w-full h-full flex items-center justify-center">Imagem de Capa</div>
                        )}
                    </div>
                </div>
            </header>

            {/* ABOUT - MOSAIC */}
            <section id="about" className="modern-container modern-about">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 w-full">
                        <div className="modern-mosaic-grid relative group">
                            <EditOverlay label="Gerenciar Fotos" action="about-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            {/* Placeholder pattern if no images, or logic to show multiple images if available in customization specifically for this, 
                                 but for now we use the 'aboutImage' as the main one and placeholders for others or just CSS blocks */}
                            <div className="mosaic-item bg-gray-100">
                                {aboutImage ? <img src={aboutImage} alt="About Main" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">Foto 1</div>}
                            </div>
                            <div className="mosaic-item bg-gray-200">
                                {/* If we had array of about images, would map here. Using static placeholder for design */}
                                <div className="w-full h-full bg-[var(--modern-primary)] opacity-10"></div>
                            </div>
                            <div className="mosaic-item bg-gray-300">
                                <div className="w-full h-full bg-[var(--modern-accent)] opacity-20"></div>
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

            {/* SERVICES / HELP */}
            <section id="services" className="modern-services">
                <div className="modern-container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <EditableText id="mod_serv_title" defaultText="Como posso te ajudar" className="text-3xl font-bold mb-4 block" tagName="h2" {...editProps} />
                        <EditableText id="mod_serv_desc" defaultText="Atravessando o fantasma fundamental." className="text-gray-500" tagName="p" {...editProps} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="service-card glass-card">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--modern-primary)]/10 flex items-center justify-center text-[var(--modern-primary)] mb-6">
                                    <EditableIcon id={`mod_serv_icon_${i}`} defaultIcon={i === 1 ? "Mic" : i === 2 ? "Brain" : "Feather"} size={24} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                </div>
                                <EditableText id={`mod_serv_t_${i}`} defaultText={i === 1 ? "Escuta Livre" : i === 2 ? "Interpretação" : "Ressignificação"} className="text-xl font-bold mb-3 block" tagName="h3" {...editProps} />
                                <EditableText id={`mod_serv_d_${i}`} defaultText="Um espaço para falar livremente sobre tudo aquilo que lhe causa angústia, sem julgamentos morais." className="text-sm text-gray-500 leading-relaxed" tagName="p" {...editProps} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GALLERY */}
            <section id="gallery" className="modern-gallery modern-container relative group">
                <EditOverlay label="Editar Galeria" action="gallery" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <EditableText id="mod_gal_title" defaultText="O Espaço" className="text-3xl font-bold mb-2 block" tagName="h2" {...editProps} />
                        <EditableText id="mod_gal_sub" defaultText="Um ambiente preparado para o seu acolhimento." className="text-gray-500" tagName="p" {...editProps} />
                    </div>
                </div>

                {gallery.length > 0 ? (
                    <div className="gallery-grid">
                        {gallery.map((img, idx) => (
                            <div key={idx} className="gallery-item group/item relative">
                                <img src={img} alt={`Gallery ${idx}`} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400">
                        Galeria Vazia (Adicione fotos no editor)
                    </div>
                )}
            </section>

            {/* FAQ */}
            <section id="faq" className="modern-faq bg-white/50">
                <div className="modern-container max-w-3xl">
                    <div className="text-center mb-12">
                        <EditableText id="mod_faq_head" defaultText="Perguntas Frequentes" className="text-3xl font-bold" tagName="h2" {...editProps} />
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="faq-item">
                                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                                    <EditableText id={`mod_faq_q_${idx}`} defaultText={faq.q} tagName="span" {...editProps} />
                                    <ChevronDown className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                                </div>
                                {openFaq === idx && (
                                    <div className="faq-answer">
                                        <EditableText id={`mod_faq_a_${idx}`} defaultText={faq.a} tagName="p" {...editProps} />
                                    </div>
                                )}
                            </div>
                        ))}
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

                    <div className="max-w-md mx-auto mb-8">
                        <StarRating storeId={store?.id || 'demo'} primaryColor={primaryColor} />
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>&copy; {new Date().getFullYear()} {d.name}. Todos os direitos reservados.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="hover:text-[var(--modern-primary)]">Instagram</a>
                            <a href="#" className="hover:text-[var(--modern-primary)]">WhatsApp</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

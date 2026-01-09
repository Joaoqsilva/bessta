import { useEffect, useState } from 'react';
import { ChevronDown, ArrowRight, Star, Instagram, Facebook, Phone } from 'lucide-react';
import './LandingPageSophisticated.css';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import type { StoreCustomization } from '../../context/StoreCustomizationService';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageSophisticated = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {

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
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;

    // Use customization for dynamic styles
    const dynamicStyle = {
        '--soph-primary': primaryColor,
        '--soph-primary-light': customization?.secondaryColor || '#ddd6fe',
        '--soph-text': '#1f2937', // Could be customizable
        '--store-font': customization?.fontFamily ? customization.fontFamily : 'Inter, sans-serif'
    } as React.CSSProperties;

    const editProps = { isEditorMode, onEditAction, customization };

    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        { q: "Quais são as especialidades atendidas?", a: "Nossa equipe multidisciplinar atende diversas demandas, desde ansiedade e depressão até desenvolvimento pessoal e carreira." },
        { q: "O atendimento é presencial ou online?", a: "Oferecemos ambas as modalidades, permitindo que você escolha a que melhor se adapta à sua rotina e conforto." },
        { q: "Como agendar uma primeira consulta?", a: "Você pode agendar diretamente pelo nosso site clicando no botão 'Agendar Consulta' ou entrando em contato via WhatsApp." }
    ];

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

                    <button onClick={onBook} className="soph-btn soph-btn-primary py-2 px-6 text-sm">
                        <EditableText id="soph_nav_cta" defaultText="Agendar" tagName="span" {...editProps} />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="soph-hero">
                <div className="soph-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-semibold uppercase tracking-wider text-[var(--soph-primary)] mb-6">
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
                            <EditOverlay label="Alterar Capa" action="cover-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            {heroImage ? (
                                <img src={heroImage} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    <EditableIcon id="soph_hero_placeholder" defaultIcon="Image" size={48} {...editProps} />
                                </div>
                            )}
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

            {/* Services Section */}
            <section id="services" className="py-20 bg-white/50 backdrop-blur-sm">
                <div className="soph-container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <EditableText id="soph_serv_title" defaultText="Como podemos ajudar" className="text-3xl font-bold mb-4" tagName="h2" {...editProps} />
                        <EditableText id="soph_serv_sub" defaultText="Abordagens modernas baseadas em evidências para o seu desenvolvimento." className="text-gray-500" tagName="p" {...editProps} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="soph-glass-card p-8 hover:bg-white transition-colors">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-[var(--soph-primary)] mb-6">
                                    <EditableIcon id={`soph_card_${i}_icon`} defaultIcon={i === 1 ? 'Brain' : i === 2 ? 'Users' : 'Smile'} size={24} {...editProps} />
                                </div>
                                <EditableText id={`soph_card_${i}_title`} defaultText={i === 1 ? "Terapia Individual" : i === 2 ? "Terapia de Casal" : "Autoconhecimento"} className="text-xl font-bold mb-3 block" tagName="h3" {...editProps} />
                                <EditableText id={`soph_card_${i}_desc`} defaultText="Sessões focadas nas suas necessidades específicas, promovendo insights e mudanças duradouras." className="text-gray-500 leading-relaxed text-sm" tagName="p" {...editProps} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24">
                <div className="soph-container soph-about-grid">
                    <div className="soph-mosaic relative group">
                        <EditOverlay label="Editar Fotos" action="about-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                        {/* Simulate mosaic with either dynamic images or placeholders */}
                        <div className="soph-mosaic-item bg-gray-200">
                            {customization?.teamImages?.[0] ? <img src={customization.teamImages[0]} alt="Team 1" /> : <div className="w-full h-full bg-slate-200"></div>}
                        </div>
                        <div className="soph-mosaic-item bg-gray-300">
                            {customization?.teamImages?.[1] ? <img src={customization.teamImages[1]} alt="Team 2" /> : aboutImage ? <img src={aboutImage} alt="Main" /> : <div className="w-full h-full bg-slate-300"></div>}
                        </div>
                        <div className="soph-mosaic-item bg-gray-100">
                            {customization?.teamImages?.[2] ? <img src={customization.teamImages[2]} alt="Team 3" /> : <div className="w-full h-full bg-slate-100"></div>}
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

            {/* Gallery Section */}
            <section id="gallery" className="py-20 bg-white">
                <div className="soph-container">
                    <div className="text-center mb-12 relative group">
                        <EditOverlay label="Gerenciar Galeria" action="gallery" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                        <EditableText id="soph_gallery_title" defaultText="Nosso Espaço" className="text-3xl font-bold" tagName="h2" {...editProps} />
                    </div>

                    {customization?.galleryImages && customization.galleryImages.length > 0 ? (
                        <div className="soph-gallery-grid">
                            {customization.galleryImages.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden hover:opacity-90 transition-opacity">
                                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                            <p className="text-gray-400">Adicione fotos na galeria para visualizar aqui.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-[var(--soph-bg)]">
                <div className="soph-container max-w-3xl">
                    <EditableText id="soph_faq_title" defaultText="Dúvidas Frequentes" className="text-3xl font-bold text-center mb-12" tagName="h2" {...editProps} />

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="soph-faq-item">
                                <div className="soph-faq-header" onClick={() => toggleFaq(idx)}>
                                    <EditableText id={`soph_faq_q_${idx}`} defaultText={faq.q} tagName="span" {...editProps} />
                                    <ChevronDown size={20} className={`transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                                </div>
                                {openFaq === idx && (
                                    <div className="soph-faq-body">
                                        <EditableText id={`soph_faq_a_${idx}`} defaultText={faq.a} tagName="p" {...editProps} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-90 pb-10 border-t border-gray-100">
                <div className="soph-container text-center">
                    <EditableText id="soph_footer_title" defaultText={d.footerTitle} className="text-2xl font-bold mb-4 block" tagName="h3" {...editProps} />
                    <EditableText id="soph_footer_text" defaultText={d.footerText} className="text-gray-500 mb-8 block" tagName="p" {...editProps} />

                    <button onClick={onBook} className="soph-btn soph-btn-primary mb-12">
                        <EditableText id="soph_footer_cta" defaultText="Agendar Horário" tagName="span" {...editProps} />
                    </button>

                    <div className="flex justify-center gap-6 mb-12">
                        {customization?.instagram && (
                            <a href={`https://instagram.com/${customization.instagram}`} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 rounded-full hover:bg-[var(--soph-primary)] hover:text-white transition-colors">
                                <Instagram size={20} />
                            </a>
                        )}
                        {customization?.whatsapp && (
                            <a href={`https://wa.me/${customization.whatsapp}`} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 rounded-full hover:bg-[var(--soph-primary)] hover:text-white transition-colors">
                                <Phone size={20} />
                            </a>
                        )}
                        {customization?.facebook && (
                            <a href={customization.facebook} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 rounded-full hover:bg-[var(--soph-primary)] hover:text-white transition-colors">
                                <Facebook size={20} />
                            </a>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-8 text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} {d.name}. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
};

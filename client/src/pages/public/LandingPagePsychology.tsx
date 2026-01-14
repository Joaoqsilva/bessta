import { useEffect, useState } from 'react';
import { ChevronDown, Star, Trash2, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './LandingPagePsychology.css';
import { EditOverlay } from '../../components/EditOverlay';
import { EditableText } from '../../components/EditableText';
import { EditableIcon } from '../../components/EditableIcon';
import { EditableImage } from '../../components/EditableImage';
import { StarRating } from '../../components/StarRating';
import { StandardFooter } from '../../components/StandardFooter';
import type { StoreCustomization } from '../../context/StoreCustomizationService';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPagePsychology = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps) => {

    // Default Texts - Combina dados existentes do store/customization com fallbacks hardcoded
    const d = {
        name: store?.name || "Ana Clara.psi",
        heroTitle: customization?.welcomeTitle || "Um espaço seguro para\nse reencontrar.",
        heroSubtitle: customization?.welcomeMessage || "Acolhimento e técnica para te ajudar a lidar com a ansiedade, superar traumas e construir uma vida com mais propósito e leveza.",
        aboutTitle: customization?.aboutTitle || "Olá, sou a Ana Clara.",
        aboutText: customization?.aboutText || "Sou psicóloga clínica (CRP 06/12345) apaixonada pelo potencial humano de transformação.\n\nAcredito que a terapia é um encontro colaborativo onde criamos um ambiente seguro para você explorar suas vulnerabilidades sem julgamentos.\n\nMinha prática é baseada em evidências científicas, mas conduzida com a sensibilidade e empatia que cada história de vida merece.",
        approachTitle: "Como posso te ajudar",
        approachDesc: "Através da Terapia Cognitivo-Comportamental (TCC), trabalhamos juntos para identificar e modificar padrões que causam sofrimento.",
        quote: "\"Quem olha para fora sonha, quem olha para dentro desperta.\"",
        quoteAuthor: "— Carl Jung",
        ctaHero: "Começar Terapia",
        footerTitle: "Vamos conversar?",
        footerText: "Dê o primeiro passo em direção ao seu bem-estar. Agenda aberta para novos pacientes."
    };

    const primaryColor = customization?.primaryColor || "#78866b";
    // Mantendo lógica de imagens via campos específicos pois requerem Upload
    const heroImage = customization?.coverImage || store?.coverImage;
    const aboutImage = customization?.aboutImage;

    // Cores customizáveis
    const buttonBg = customization?.buttonBgColor || primaryColor;
    const buttonText = customization?.buttonTextColor || '#ffffff';
    const footerBg = customization?.footerBgColor || '#ffffff';
    const footerText = customization?.footerTextColor || '#6b7280';
    const iconColor = customization?.iconColor || primaryColor;

    const dynamicStyle = {
        '--psy-primary': primaryColor,
        '--psy-button-bg': buttonBg,
        '--psy-button-text': buttonText,
        '--psy-footer-bg': footerBg,
        '--psy-footer-text': footerText,
        '--psy-icon': iconColor,
    } as React.CSSProperties;

    // Helper para passar props comuns
    const editProps = { isEditorMode, onEditAction, customization };

    useEffect(() => {
        window.scrollTo(0, 0);
        if (isEditorMode && onEditAction) {
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                const defaultTestimonials = {
                    testimonials: [
                        { id: '1', text: 'A terapia mudou minha forma de ver o mundo.', author: 'Julia M.', role: 'Paciente', rating: 5 },
                        { id: '2', text: 'Ana Clara é uma profissional excepcional.', author: 'Ricardo S.', role: 'Paciente', rating: 5 },
                        { id: '3', text: 'Sinto-me muito mais leve após cada sessão.', author: 'Beatriz L.', role: 'Paciente', rating: 5 }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-testimonials__', JSON.stringify(defaultTestimonials));
            }
            if (!customization?.team || customization.team.length === 0) {
                const defaultTeam = {
                    team: [
                        { id: '1', name: 'Ana Clara', role: 'Psicóloga Clínica', bio: 'Especialista em TCC e Neuropsicologia.' }
                    ],
                    images: ["", "", ""]
                };
                onEditAction('init-team__', JSON.stringify(defaultTeam));
            }
        }
    }, [isEditorMode]);

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        { q: "Como funciona a terapia online?", a: "A terapia online ocorre via videochamada, em uma plataforma segura e sigilosa. A eficácia é a mesma do atendimento presencial, com mais conforto e flexibilidade." },
        { q: "Qual a duração da sessão?", a: "As sessões têm duração média de 50 minutos e ocorrem semanalmente, salvo casos específicos combinados previamente." },
        { q: "Aceita convênios?", a: "Atualmente atendimento apenas particular, mas emito recibo para reembolso no seu plano de saúde." },
        { q: "Para quem é a TCC?", a: "A Terapia Cognitivo-Comportamental é indicada para tratamento de ansiedade, depressão, fobias e desenvolvimento pessoal, focando em mudar padrões de pensamento e comportamento." }
    ];

    return (
        <div className="psy-wrapper" style={dynamicStyle}>
            {/* Background Blobs */}
            <div className="psy-blob-bg" style={{ top: '-10%', left: '-10%', width: '600px', height: '600px', background: '#e5e9e2' }}></div>
            <div className="psy-blob-bg" style={{ bottom: '10%', right: '-5%', width: '500px', height: '500px', background: '#fae8e0' }}></div>

            <nav className="psy-nav psy-container">
                <div className="psy-logo relative group z-20">
                    <EditableText id="psy_name" defaultText={d.name} tagName="span" {...editProps} />
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600 z-20">
                    <a href="#approach" className="hover:text-[var(--psy-primary)]">
                        <EditableText id="psy_nav_approach" defaultText="Abordagem" tagName="span" {...editProps} />
                    </a>
                    <a href="#about" className="hover:text-[var(--psy-primary)]">
                        <EditableText id="psy_nav_about" defaultText="Sobre Mim" tagName="span" {...editProps} />
                    </a>
                    <a href="#faq" className="hover:text-[var(--psy-primary)]">
                        <EditableText id="psy_nav_faq" defaultText="Dúvidas" tagName="span" {...editProps} />
                    </a>
                </div>
                <div className="hidden md:flex items-center gap-4 z-20">

                    <button type="button" onClick={onBook} className="psy-btn psy-btn-outline px-5 py-2 text-sm">
                        <EditableText id="psy_nav_cta" defaultText="Agendar Sessão" tagName="span" {...editProps} />
                    </button>
                </div>
            </nav>

            <header className="psy-hero">
                <div className="psy-container w-full flex flex-col md:flex-row items-center gap-12">
                    <div className="psy-hero-content animate-fade-in relative group p-4 border border-transparent hover:bg-white/30 rounded-xl transition-all z-10">
                        <EditableText
                            id="psy_hero_tag"
                            defaultText="Psicologia Clínica"
                            className="text-[var(--psy-primary)] font-medium tracking-wider text-sm uppercase mb-4 block"
                            tagName="span"
                            {...editProps}
                        />
                        <EditableText
                            id="psy_hero_title"
                            defaultText={d.heroTitle}
                            className="psy-title"
                            tagName="h1"
                            {...editProps}
                        />
                        <EditableText
                            id="psy_hero_subtitle"
                            defaultText={d.heroSubtitle}
                            className="psy-lead"
                            tagName="p"
                            {...editProps}
                        />
                        <div className="flex gap-4">
                            <button type="button" onClick={onBook} className="psy-btn psy-btn-primary">
                                <EditableText id="psy_hero_cta" defaultText={d.ctaHero} tagName="span" {...editProps} />
                            </button>
                            <a href="#approach" className="psy-btn psy-btn-outline border-transparent hover:bg-white/50 flex gap-2 items-center">
                                <EditableText id="psy_hero_more" defaultText="Saiba mais" tagName="span" {...editProps} />
                                <EditableIcon id="psy_arrow_icon" defaultIcon="ArrowRight" size={16} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            </a>
                        </div>
                    </div>

                    <div className="hidden md:block relative flex-1 h-[600px] group">
                        {/* Photo Frame - Mantém EditOverlay de Imagem */}
                        <div className="psy-photo-frame relative">
                            <EditOverlay label="Alterar Capa" action="cover-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            {heroImage ? (
                                <img src={heroImage} alt={d.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#d6cfc7] flex flex-col items-center justify-end overflow-hidden relative">
                                    <div className="absolute inset-0 bg-[#e0dcd9]"></div>
                                    <div className="w-48 h-48 bg-[#ccc6be] rounded-full mb-12 relative z-10"></div>
                                    <div className="w-64 h-32 bg-[#bfb8af] rounded-t-full relative z-10"></div>
                                </div>
                            )}
                        </div>
                        {/* Floating Cards */}
                        <div className="absolute top-[20%] left-[10%] bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 animate-float drop-shadow-lg z-20">
                            <div className="bg-green-100 p-2 rounded-full text-[var(--psy-primary)]">
                                <EditableIcon id="psy_float_icon_1" defaultIcon="Brain" size={20} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            </div>
                            <EditableText id="psy_float_1" defaultText="Saúde Mental" className="text-sm font-medium text-gray-600" tagName="span" {...editProps} />
                        </div>
                        <div className="absolute bottom-[20%] right-[20%] bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 animate-float drop-shadow-lg z-20" style={{ animationDelay: '1s' }}>
                            <div className="bg-orange-100 p-2 rounded-full text-[var(--psy-accent)]">
                                <EditableIcon id="psy_float_icon_2" defaultIcon="Smile" size={20} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                            </div>
                            <EditableText id="psy_float_2" defaultText="Autoconhecimento" className="text-sm font-medium text-gray-600" tagName="span" {...editProps} />
                        </div>
                    </div>
                </div>
            </header>

            <section className="psy-container" id="approach">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <EditableText id="psy_approach_title" defaultText={d.approachTitle} className="psy-section-title" tagName="h2" {...editProps} />
                    <EditableText id="psy_approach_desc" defaultText={d.approachDesc} className="text-gray-500 text-lg" tagName="p" {...editProps} />
                </div>

                <div className="psy-cards-grid">
                    <div className="psy-card">
                        <div className="psy-icon bg-[#e6f0e6] p-4 rounded-full">
                            <EditableIcon id="psy_card_icon_1" defaultIcon="Brain" size={32} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                        </div>
                        <EditableText id="psy_card_1_title" defaultText="Ansiedade & Estresse" className="text-xl mb-3 block font-semibold" tagName="h3" {...editProps} />
                        <EditableText id="psy_card_1_desc" defaultText="Aprenda técnicas para gerenciar crises, reduzir a preocupação excessiva e retomar o controle da sua rotina." className="text-gray-500 leading-relaxed" tagName="p" {...editProps} />
                    </div>
                    <div className="psy-card border-[var(--psy-primary-light)] ring-1 ring-[var(--psy-primary-light)]">
                        <div className="psy-icon bg-[#fdf2e9] p-4 rounded-full text-[var(--psy-accent)]">
                            <EditableIcon id="psy_card_icon_2" defaultIcon="Sparkles" size={32} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                        </div>
                        <EditableText id="psy_card_2_title" defaultText="Autoconhecimento" className="text-xl mb-3 block font-semibold" tagName="h3" {...editProps} />
                        <EditableText id="psy_card_2_desc" defaultText="Entenda suas emoções, fortaleça sua autoestima e descubra seus valores para tomar decisões mais alinhadas." className="text-gray-500 leading-relaxed" tagName="p" {...editProps} />
                    </div>
                    <div className="psy-card">
                        <div className="psy-icon bg-[#f0f4f8] p-4 rounded-full text-[#6b7c93]">
                            <EditableIcon id="psy_card_icon_3" defaultIcon="MessageCircle" size={32} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                        </div>
                        <EditableText id="psy_card_3_title" defaultText="Relacionamentos" className="text-xl mb-3 block font-semibold" tagName="h3" {...editProps} />
                        <EditableText id="psy_card_3_desc" defaultText="Melhore sua comunicação, estabeleça limites saudáveis e construa vínculos mais profundos e satisfatórios." className="text-gray-500 leading-relaxed" tagName="p" {...editProps} />
                    </div>
                </div>
            </section>

            <div className="psy-quote-section">
                <div className="psy-container">
                    <EditableText id="psy_quote" defaultText={d.quote} className="psy-quote-text" tagName="p" {...editProps} />
                    <div className="mt-8 font-medium text-[var(--psy-primary)] uppercase tracking-widest text-sm">
                        <EditableText id="psy_quote_author" defaultText={d.quoteAuthor} tagName="span" {...editProps} />
                    </div>
                </div>
            </div>

            <section className="psy-container py-16" id="about">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 relative group">
                        <EditOverlay label="Foto Perfil" action="about-image" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                        <div className="bg-[#f0ece9] rounded-[3rem] p-8 aspect-square flex items-center justify-center relative">
                            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex items-center justify-center text-[#d6cfc7]">
                                {aboutImage ? (
                                    <img src={aboutImage} alt="Sobre Mim" className="w-full h-full object-cover" />
                                ) : (
                                    <EditableIcon id="psy_about_placeholder" defaultIcon="Heart" size={64} strokeWidth={0.5} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative group p-4 border border-transparent hover:border-slate-100 rounded-xl transition-all">
                        {/* TEXTOS DA SEÇÃO SOBRE */}
                        <EditableText
                            id="psy_about_tag"
                            defaultText="Sobre Mim"
                            className="text-[var(--psy-primary)] font-medium uppercase tracking-widest text-sm mb-4 block"
                            tagName="span"
                            {...editProps}
                        />
                        <EditableText
                            id="psy_about_title"
                            defaultText={d.aboutTitle}
                            className="text-4xl font-serif text-[#4a4a4a] mb-6"
                            tagName="h2"
                            {...editProps}
                        />
                        <EditableText
                            id="psy_about_text"
                            defaultText={d.aboutText}
                            className="space-y-6 text-gray-600 text-lg leading-relaxed"
                            tagName="div"
                            {...editProps}
                        />

                        <div className="mt-8 flex gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                <EditableIcon id="psy_stat_icon_1" defaultIcon="Calendar" size={16} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                <EditableText id="psy_stat_1" defaultText="+5.000 horas de atendimento" tagName="span" {...editProps} />
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                <EditableIcon id="psy_stat_icon_2" defaultIcon="Brain" size={16} customization={customization} isEditorMode={isEditorMode} onEditAction={onEditAction} />
                                <EditableText id="psy_stat_2" defaultText="Esp. em Neuropsicologia" tagName="span" {...editProps} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section (Optional/Expandable) */}
            <section className="psy-container py-16" id="team">
                <div className="text-center mb-12">
                    <EditableText id="psy_team_title" defaultText="Nossa Equipe" className="psy-section-title" tagName="h2" {...editProps} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(customization?.team && customization.team.length > 0 ? customization.team : customization?.teamImages?.length ? [] : [
                        { name: 'Ana Clara', role: 'Psicóloga Clínica', bio: 'Especialista em TCC.' }
                    ]).map((member: any, i: number) => (
                        <div key={i} className="psy-card group relative overflow-hidden">
                            <div className="h-64 bg-[#f0ece9] relative rounded-xl overflow-hidden mb-4">
                                <EditableImage
                                    editKey={`teamImages__${i}`}
                                    currentSrc={customization?.teamImages?.[i]}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    alt={member.name}
                                    renderPlaceholder={() => (
                                        <div className="w-full h-full flex items-center justify-center text-[#d6cfc7]">
                                            <EditableIcon id={`psy_team_ph_${i}`} defaultIcon="User" size={48} {...editProps} />
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="text-center">
                                <EditableText id={`psy_team_n${i}`} defaultText={member.name || 'Nome'} className="font-bold text-xl mb-1 block text-[#4a4a4a]" tagName="h3" {...editProps} />
                                <EditableText id={`psy_team_r${i}`} defaultText={member.role || 'Cargo'} className="text-[var(--psy-primary)] text-sm mb-2 block font-medium uppercase tracking-wider" tagName="span" {...editProps} />
                                <EditableText id={`psy_team_b${i}`} defaultText={member.bio || 'Bio'} className="text-gray-500 text-sm leading-relaxed" tagName="p" {...editProps} />
                            </div>
                            {isEditorMode && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditAction?.('team-remove__' + i); }}
                                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-600 z-20 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    {isEditorMode && (
                        <button
                            onClick={() => onEditAction?.('team-add')}
                            className="psy-card flex flex-col items-center justify-center cursor-pointer hover:bg-[#f0ece9] transition-colors border-2 border-dashed border-[#d6cfc7] min-h-[300px]"
                        >
                            <Plus size={24} className="text-[#a8a4a0] mb-2" />
                            <span className="font-bold text-[#a8a4a0]">Adicionar Membro</span>
                        </button>
                    )}
                </div>
            </section>

            <section className="psy-container py-16 relative group">
                <EditOverlay label="Editar Galeria" action="gallery" isEditorMode={isEditorMode} onEditAction={onEditAction} />
                {(isEditorMode || (customization?.galleryImages && customization.galleryImages.length > 0)) && (
                    <>
                        <div className="text-center mb-12">
                            <EditableText id="psy_gallery_title" defaultText="Espaço & Ambiente" className="psy-section-title" tagName="h2" {...editProps} />
                        </div>

                        {(!customization?.galleryImages || customization.galleryImages.length === 0) ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 bg-gray-50">
                                <p>Galeria vazia. Clique em "Editar Galeria" para adicionar fotos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {customization.galleryImages.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <img src={img} alt={`Ambiente ${idx} `} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Testimonials Section */}
            <section className="psy-container py-20 bg-[#f9f9f9] rounded-3xl my-12" id="testimonials">
                <div className="text-center mb-12">
                    <EditableText id="psy_test_title" defaultText="Depoimentos" className="psy-section-title" tagName="h2" {...editProps} />
                    <EditableText id="psy_test_sub" defaultText="Histórias de transformação" className="text-gray-500" tagName="p" {...editProps} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(customization?.testimonials && customization.testimonials.length > 0 ? customization.testimonials : [
                        { id: '1', text: 'A terapia mudou minha forma de ver o mundo.', author: 'Julia M.', role: 'Paciente', rating: 5 },
                        { id: '2', text: 'Ana Clara é uma profissional excepcional.', author: 'Ricardo S.', role: 'Paciente', rating: 5 },
                        { id: '3', text: 'Sinto-me muito mais leve após cada sessão.', author: 'Beatriz L.', role: 'Paciente', rating: 5 }
                    ]).map((testim: any, i: number) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm relative group">
                            <div className="flex gap-1 mb-4 text-[#fcd34d]" title={isEditorMode ? "Alterar avaliação" : ""}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        size={16}
                                        fill={s <= (testim.rating || 5) ? "currentColor" : "none"}
                                        className={`cursor-pointer ${s <= (testim.rating || 5) ? '' : 'text-gray-200'}`}
                                        onClick={isEditorMode ? (e) => { e.stopPropagation(); onEditAction?.(`testimonial-rating__${i}__${s}`); } : undefined}
                                    />
                                ))}
                            </div>
                            <div className="mb-6 flex gap-1 text-gray-600 italic leading-relaxed">
                                "
                                <EditableText id={`psy_test_t${i}`} defaultText={testim.text} tagName="span" {...editProps} />
                                "
                            </div>
                            <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 relative shrink-0">
                                    <EditableImage
                                        editKey={`testimonialImages__${i}`}
                                        currentSrc={customization?.testimonialImages?.[i]}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                        className="w-full h-full object-cover"
                                        alt={testim.author}
                                        renderPlaceholder={() => (
                                            <div className="w-full h-full bg-[var(--psy-primary)] text-white flex items-center justify-center font-bold text-xs">
                                                {testim.author.charAt(0)}
                                            </div>
                                        )}
                                    />
                                </div>
                                <div>
                                    <EditableText id={`psy_test_a${i}`} defaultText={testim.author} className="font-bold text-sm block text-gray-900" tagName="span" {...editProps} />
                                    <EditableText id={`psy_test_r${i}`} defaultText={testim.role || 'Paciente'} className="text-xs text-gray-500 block" tagName="span" {...editProps} />
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
                        className="w-full mt-8 py-6 border-2 border-dashed border-[var(--psy-primary)]/30 hover:bg-[var(--psy-primary)]/5 flex flex-col items-center justify-center cursor-pointer transition-colors group rounded-xl"
                    >
                        <Plus size={24} className="text-[var(--psy-primary)] mb-2" />
                        <span className="font-bold text-[var(--psy-primary)] text-lg">Adicionar Depoimento</span>
                    </button>
                )}
            </section>

            <section className="psy-container py-20 max-w-3xl" id="faq">
                <EditableText id="psy_faq_title" defaultText="Perguntas Frequentes" className="psy-section-title" tagName="h2" {...editProps} />
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="psy-faq-item">
                            <div className="psy-faq-q" onClick={() => toggleFaq(idx)}>
                                <EditableText id={`psy_faq_q_${idx}`} defaultText={faq.q} tagName="span" {...editProps} />
                                <ChevronDown size={20} className={`transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                            </div>
                            {openFaq === idx && (
                                <div className="psy-faq-a animate-fade-in">
                                    <EditableText id={`psy_faq_a_${idx}`} defaultText={faq.a} tagName="p" {...editProps} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <footer style={{ backgroundColor: footerBg, color: footerText }} className="border-t border-gray-100 py-12 mt-12">
                <div className="psy-container text-center">
                    <EditableText id="psy_footer_title" defaultText={d.footerTitle} className="font-serif text-2xl text-[var(--psy-primary)] mb-6 block" tagName="h3" {...editProps} />
                    <EditableText id="psy_footer_text" defaultText={d.footerText} className="text-gray-500 mb-8 max-w-md mx-auto block" tagName="p" {...editProps} />

                    <button type="button" onClick={onBook} className="psy-btn psy-btn-primary mb-12">
                        <EditableText id="psy_footer_cta" defaultText="Agendar Horário" tagName="span" {...editProps} />
                    </button>

                    {/* Rating & Feedback Section */}
                    <div className="max-w-lg mx-auto mb-8">
                        <StarRating
                            storeId={store?.id || 'demo-psychology'}
                            primaryColor="var(--psy-primary, #7c3aed)"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 border-t border-gray-50 pt-8">
                        <div>&copy; {new Date().getFullYear()} <EditableText id="psy_footer_copy" defaultText={d.name} tagName="span" {...editProps} /></div>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-gray-600"><EditableText id="psy_footer_link1" defaultText="Instagram" tagName="span" {...editProps} /></a>
                            <a href="#" className="hover:text-gray-600"><EditableText id="psy_footer_link2" defaultText="LinkedIn" tagName="span" {...editProps} /></a>
                            <a href="#" className="hover:text-gray-600"><EditableText id="psy_footer_link3" defaultText="WhatsApp" tagName="span" {...editProps} /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

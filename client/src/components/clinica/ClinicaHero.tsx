import { ArrowRight } from 'lucide-react';
import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaHeroProps {
    content: ClinicaContent['hero'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
    onBook?: () => void;
}

export const ClinicaHero = ({ content, isEditorMode, onEditAction, customization, onBook }: ClinicaHeroProps) => {

    const editProps = { isEditorMode, onEditAction, customization };
    const heroImage = customization?.coverImage || "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?q=80&w=800&auto=format&fit=crop";

    return (
        <section id="hero" className="clinica-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '100px' }}>
            {/* Background Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="clinica-container" style={{ width: '100%' }}>
                <div className="grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
                    <div className="hero-content fade-in-up">
                        <span className="clinica-subtitle" style={{ color: 'var(--clinica-accent)', marginBottom: '1rem', display: 'block' }}>
                            <EditableText
                                id="clinica_hero_subtitle"
                                defaultText={content.subtitle}
                                tagName="span"
                                {...editProps}
                            />
                        </span>

                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                            marginBottom: '1.5rem',
                            color: 'var(--clinica-primary)',
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em'
                        }}>
                            <EditableText
                                id="clinica_hero_title"
                                defaultText={content.title}
                                tagName="span"
                                {...editProps}
                            />
                        </h1>

                        <div style={{
                            fontSize: '1.125rem',
                            color: 'var(--clinica-gray)',
                            marginBottom: '2.5rem',
                            maxWidth: '540px',
                            lineHeight: 1.8
                        }}>
                            <EditableText
                                id="clinica_hero_desc"
                                defaultText={content.description}
                                tagName="p"
                                {...editProps}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={onBook}
                                className="clinica-btn clinica-btn-primary"
                            >
                                <EditableText
                                    id="clinica_hero_btn_1"
                                    defaultText={content.buttons[0].text}
                                    tagName="span"
                                    {...editProps}
                                />
                                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                            <a
                                href="#about"
                                className="clinica-btn clinica-btn-outline"
                            >
                                <EditableText
                                    id="clinica_hero_btn_2"
                                    defaultText={content.buttons[1].text}
                                    tagName="span"
                                    {...editProps}
                                />
                            </a>
                        </div>
                    </div>

                    <div className="hero-visual fade-in-up delay-200" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <div className="image-frame relative group" style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '500px',
                            aspectRatio: '4/5',
                            borderRadius: '160px 160px 20px 20px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <EditableImage
                                editKey="coverImage"
                                currentSrc={heroImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover"
                                label="Alterar Capa"
                                alt="Ambiente Terapêutico"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Glass Overlay Card */}
                            <div className="glass-card" style={{
                                position: 'absolute',
                                bottom: '20px',
                                right: '-20px',
                                left: '20px',
                                padding: '1.5rem',
                                maxWidth: '80%',
                                zIndex: 10
                            }}>
                                <p style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontSize: '1.1rem',
                                    color: 'var(--clinica-primary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    <EditableText
                                        id="clinica_hero_quote"
                                        defaultText='"O inconsciente é estruturado como uma linguagem."'
                                        tagName="span"
                                        {...editProps}
                                    />
                                </p>
                                <span style={{ fontSize: '0.875rem', color: 'var(--clinica-gray)', display: 'block', textAlign: 'right' }}>
                                    — <EditableText
                                        id="clinica_hero_author"
                                        defaultText='Jacques Lacan'
                                        tagName="span"
                                        {...editProps}
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .image-frame { margin-top: 2rem; border-radius: 20px; aspectRatio: 16/9; }
                    .glass-card { right: 10px; left: 10px; bottom: 10px; }
                }
            `}</style>
        </section>
    );
};

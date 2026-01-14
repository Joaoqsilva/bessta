import { Check } from 'lucide-react';
import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaAboutProps {
    content: ClinicaContent['about'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
}

export const ClinicaAbout = ({ content, isEditorMode, onEditAction, customization }: ClinicaAboutProps) => {

    const editProps = { isEditorMode, onEditAction, customization };

    // Fallback/Resolve Images. For the mosaic we might just use the About Image for the main slot 
    // and keep the others static or allow editing them via a "Manage Gallery" action ultimately.
    // For simplicity, let's map the first mosaic image to 'aboutImage' and others to placeholders/static if not customizable yet.
    const mainImage = customization?.aboutImage || content.images[0];

    return (
        <section id="about" className="clinica-section" style={{ background: 'var(--clinica-light)' }}>
            <div className="clinica-container">
                <div className="grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
                    {/* Image Mosaic */}
                    <div className="about-mosaic group relative" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        gridTemplateRows: 'repeat(12, 1fr)',
                        aspectRatio: '1/1',
                        gap: '1rem',
                        position: 'relative'
                    }}>


                        {/* Decorative background element */}
                        <div style={{
                            position: 'absolute',
                            top: '-5%',
                            left: '-5%',
                            width: '60%',
                            height: '60%',
                            background: 'var(--clinica-secondary)',
                            borderRadius: '50% 0 50% 50%',
                            zIndex: 0,
                            opacity: 0.5
                        }}></div>

                        <div className="mosaic-item relative group" style={{ gridColumn: '1 / 8', gridRow: '1 / 8', zIndex: 1, borderRadius: '24px 0 24px 24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <EditableImage
                                editKey="aboutImage"
                                currentSrc={mainImage}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover"
                                label="Imagem Principal"
                                alt="Sobre 1"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        {(customization?.galleryImages?.[0] || content.images[1]) && (
                            <div className="mosaic-item relative group" style={{ gridColumn: '8 / 13', gridRow: '2 / 7', zIndex: 2, borderRadius: '16px', overflow: 'hidden', transform: 'translateY(10px)' }}>
                                <EditableImage
                                    editKey="galleryImages__0"
                                    currentSrc={customization?.galleryImages?.[0] || content.images[1]}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    label="Imagem 2"
                                    alt="Sobre 2"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        {(customization?.galleryImages?.[1] || content.images[2]) && (
                            <div className="mosaic-item relative group" style={{ gridColumn: '6 / 13', gridRow: '7 / 13', zIndex: 1, borderRadius: '0 24px 24px 24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                <EditableImage
                                    editKey="galleryImages__1"
                                    currentSrc={customization?.galleryImages?.[1] || content.images[2]}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    label="Imagem 3"
                                    alt="Sobre 3"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        {(customization?.galleryImages?.[2] || content.images[3]) && (
                            <div className="mosaic-item glass-panel relative group" style={{
                                gridColumn: '2 / 6',
                                gridRow: '8 / 12',
                                zIndex: 3,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem'
                            }}>
                                <EditableImage
                                    editKey="galleryImages__2"
                                    currentSrc={customization?.galleryImages?.[2] || content.images[3]}
                                    isEditorMode={isEditorMode}
                                    onEditAction={onEditAction}
                                    className="w-full h-full object-cover"
                                    label="Imagem 4"
                                    alt="Sobre 4"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="about-content">
                        <span className="clinica-subtitle"><EditableText id="cl_abt_label" defaultText="Sobre Nós" tagName="span" {...editProps} /></span>
                        <h2 className="clinica-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
                            <EditableText
                                id="clinica_about_title"
                                defaultText={content.title}
                                tagName="span"
                                {...editProps}
                            />
                        </h2>
                        <div style={{ fontSize: '1.1rem', color: 'var(--clinica-gray)', marginBottom: '2rem', whiteSpace: 'pre-line' }}>
                            <EditableText
                                id="clinica_about_desc"
                                defaultText={content.description}
                                tagName="div"
                                {...editProps}
                            />
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {content.highlights.map((highlight, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--clinica-dark)', fontSize: '1.05rem' }}>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'var(--clinica-secondary)',
                                        color: 'var(--clinica-primary)'
                                    }}>
                                        <Check size={14} strokeWidth={3} />
                                    </span>
                                    <EditableText
                                        id={`clinica_about_hl_${idx}`}
                                        defaultText={highlight}
                                        tagName="span"
                                        {...editProps}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .mosaic-item img { transition: transform 0.6s ease; }
                .mosaic-item:hover img { transform: scale(1.05); }
                @media (max-width: 768px) {
                    .about-mosaic { display: none; } /* Simplify for mobile or stack images differently */
                }
            `}</style>
        </section>
    );
};

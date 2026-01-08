import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { EditOverlay } from '../EditOverlay';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaGalleryProps {
    content: ClinicaContent['gallery'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
}

export const ClinicaGallery = ({ content, isEditorMode, onEditAction, customization }: ClinicaGalleryProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const editProps = { isEditorMode, onEditAction, customization };

    // In a real scenario we'd merge galleryImages from customization
    const galleryImages = customization?.galleryImages?.length ? customization.galleryImages.map(src => ({ src, alt: 'Gallery Image' })) : content.images;

    return (
        <section id="gallery" className="clinica-section group relative" style={{ background: '#fff' }}>
            <EditOverlay label="Editar Galeria" action="gallery" isEditorMode={isEditorMode} onEditAction={onEditAction} />
            <div className="clinica-container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="clinica-subtitle">Galeria</span>
                    <h2 className="clinica-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        <EditableText
                            id="clinica_gallery_title"
                            defaultText={content.title}
                            tagName="span"
                            {...editProps}
                        />
                    </h2>
                    <p style={{ color: 'var(--clinica-gray)', maxWidth: '600px', margin: '0 auto' }}>
                        <EditableText
                            id="clinica_gallery_desc"
                            defaultText={content.description}
                            tagName="span"
                            {...editProps}
                        />
                    </p>
                </div>

                <div className="grid-3" style={{ gap: '1.5rem' }}>
                    {galleryImages.map((img, idx) => (
                        <div
                            key={idx}
                            className="gallery-item"
                            onClick={() => setSelectedImage(img.src)}
                            style={{
                                position: 'relative',
                                aspectRatio: idx % 4 === 0 ? '4/3' : (idx % 3 === 0 ? '3/4' : '1/1'), // Varied aspect ratios
                                borderRadius: '16px',
                                overflow: 'hidden',
                                cursor: 'zoom-in',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                            }}
                        >
                            <img
                                src={`${img.src}?q=80&w=600&auto=format&fit=crop`}
                                alt={img.alt}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                            />
                            <div className="gallery-overlay" style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(45, 90, 74, 0.4)',
                                backdropFilter: 'blur(4px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                            }}>
                                <ZoomIn color="white" size={32} />
                            </div>
                        </div>
                    ))}
                    {galleryImages.length === 0 && (
                        <div style={{
                            gridColumn: '1 / -1',
                            height: '200px',
                            border: '2px dashed #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            borderRadius: '16px'
                        }}>
                            Galeria Vazia (Clique para adicionar fotos)
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 2000,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoom"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            borderRadius: '8px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            animation: 'zoomIn 0.3s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <style>{`
                .gallery-item:hover img { transform: scale(1.1); }
                .gallery-item:hover .gallery-overlay { opacity: 1; }
                @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </section>
    );
};

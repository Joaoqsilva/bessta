import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaGalleryProps {
    content: ClinicaContent['gallery'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
}

export const ClinicaGallery = ({ content, isEditorMode, onEditAction, customization }: ClinicaGalleryProps) => {
    const editProps = { isEditorMode, onEditAction, customization };

    // Use customization images if available, otherwise use default content
    const displayImages = (customization?.galleryImages && customization.galleryImages.length > 0)
        ? customization.galleryImages.map((src, idx) => ({ src, alt: `Imagem ${idx + 1}` }))
        : content.images;

    return (
        <section id="gallery" className="clinica-section group relative" style={{ background: '#fff' }}>
            <div className="clinica-container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="clinica-subtitle"><EditableText id="cl_gal_label" defaultText="Galeria" tagName="span" {...editProps} /></span>
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
                    {(isEditorMode ? (displayImages.length > 0 ? displayImages : []) : displayImages.filter(img => img.src)).map((img, idx) => (
                        <div
                            key={idx}
                            className="gallery-item group relative"
                            style={{
                                position: 'relative',
                                aspectRatio: idx % 4 === 0 ? '4/3' : (idx % 3 === 0 ? '3/4' : '1/1'), // Varied aspect ratios
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                            }}
                        >
                            <EditableImage
                                editKey={`galleryImages__${idx}`}
                                currentSrc={img.src}
                                isEditorMode={isEditorMode}
                                onEditAction={onEditAction}
                                className="w-full h-full object-cover"
                                label={`Imagem ${idx + 1}`}
                                alt={img.alt}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                            />

                            {isEditorMode && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditAction?.('gallery-remove__' + idx); }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 z-20"
                                    title="Remover Imagem"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {isEditorMode && (
                        <button
                            onClick={() => onEditAction?.('gallery-add')}
                            style={{
                                height: '200px',
                                border: '2px dashed #4ade80',
                                backgroundColor: '#f0fdf4',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#15803d',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                width: '100%',
                                aspectRatio: '1/1'
                            }}
                            className="group hover:bg-green-100"
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: '#dcfce7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.5rem'
                            }} className="group-hover:bg-green-200">
                                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>+</span>
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Adicionar Foto</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Lightbox removed (handled by EditableImage) */}

            <style>{`
                .gallery-item:hover img { transform: scale(1.1); }
                .gallery-item:hover .gallery-overlay { opacity: 1; }
                @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </section>
    );
};

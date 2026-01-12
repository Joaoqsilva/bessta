import { Brain, Users, BookOpen, MessageCircle, Heart, Sparkles, Plus, Trash2 } from 'lucide-react';

import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { EditableIcon } from '../EditableIcon';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaServicesProps {
    content: ClinicaContent['services'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
}

const iconMap: Record<string, any> = {
    Brain: Brain,
    Users: Users,
    BookOpen: BookOpen,
    MessageCircle: MessageCircle,
    Heart: Heart,
    Sparkles: Sparkles
};

export const ClinicaServices = ({ content, isEditorMode, onEditAction, customization }: ClinicaServicesProps) => {

    const editProps = { isEditorMode, onEditAction, customization };

    return (
        <section id="services" className="clinica-section" style={{
            background: 'linear-gradient(180deg, var(--clinica-light) 0%, rgba(201, 168, 108, 0.1) 100%)',
            position: 'relative'
        }}>
            {/* Background Blob */}
            <div className="blob blob-1" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3 }}></div>

            <div className="clinica-container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="clinica-subtitle"><EditableText id="clinica_services_label" defaultText="Atendimento" tagName="span" {...editProps} /></span>
                    <h2 className="clinica-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        <EditableText
                            id="clinica_services_title"
                            defaultText={content.title}
                            tagName="span"
                            {...editProps}
                        />
                    </h2>
                    <p style={{ color: 'var(--clinica-gray)', maxWidth: '600px', margin: '0 auto' }}>
                        <EditableText
                            id="clinica_services_sub"
                            defaultText={content.subtitle}
                            tagName="span"
                            {...editProps}
                        />
                    </p>
                </div>

                <div className="grid-4" style={{ gap: '2rem' }}>
                    {(customization?.servicesList && customization.servicesList.length > 0 ? customization.servicesList : content.items).map((item, idx) => {
                        // Handle both old 'icon' and new 'iconName' property if one exists, fallback to item.icon or item.iconName
                        const defaultIconName = (item as any).iconName || item.icon || 'Sparkles';
                        const Icon = iconMap[defaultIconName] || Sparkles;

                        return (
                            <div
                                key={idx}
                                className="glass-card relative group"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    padding: '2.5rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.6)'
                                }}
                            >
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '20px',
                                    background: 'var(--clinica-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    color: 'var(--clinica-primary)',
                                    boxShadow: '0 8px 16px rgba(45, 90, 74, 0.1)'
                                }}>
                                    <EditableIcon
                                        id={`clinica_serv_icon_${idx}`}
                                        defaultIcon={defaultIconName}
                                        size={32}
                                        customization={customization}
                                        isEditorMode={isEditorMode}
                                        onEditAction={onEditAction}
                                    />
                                </div>

                                <h3 style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    color: 'var(--clinica-dark)',
                                    marginBottom: '1rem'
                                }}>
                                    <EditableText
                                        id={`clinica_serv_title_${idx}`}
                                        defaultText={item.title}
                                        tagName="span"
                                        {...editProps}
                                    />
                                </h3>

                                <div style={{
                                    fontSize: '0.95rem',
                                    color: 'var(--clinica-gray)',
                                    lineHeight: 1.6
                                }}>
                                    <EditableText
                                        id={`clinica_serv_desc_${idx}`}
                                        defaultText={item.description}
                                        tagName="p"
                                        {...editProps}
                                    />
                                </div>

                                {isEditorMode && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEditAction?.('service-remove__' + idx); }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                                        title="Remover Serviço"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {isEditorMode && (
                        <div
                            className="glass-card flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--clinica-primary)] bg-white/30 hover:bg-white/50 cursor-pointer transition-all"
                            onClick={() => onEditAction?.('service-add')}
                            style={{ minHeight: '300px' }}
                        >
                            <div className="w-16 h-16 rounded-full bg-[var(--clinica-secondary)] flex items-center justify-center text-[var(--clinica-primary)] mb-4">
                                <Plus size={32} />
                            </div>
                            <span className="font-serif text-lg font-semibold text-[var(--clinica-dark)]">Adicionar Serviço</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

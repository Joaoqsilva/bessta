import { Brain, Users, BookOpen, MessageCircle, Heart, Sparkles } from 'lucide-react';
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
                    <span className="clinica-subtitle">Atendimento</span>
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
                    {content.items.map((item, idx) => {
                        const defaultIconName = item.icon || 'Sparkles';
                        const Icon = iconMap[defaultIconName] || Sparkles;

                        return (
                            <div
                                key={idx}
                                className="glass-card"
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
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

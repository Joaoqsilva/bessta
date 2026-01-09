import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaFAQProps {
    content: ClinicaContent['faq'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
}

export const ClinicaFAQ = ({ content, isEditorMode, onEditAction, customization }: ClinicaFAQProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const editProps = { isEditorMode, onEditAction, customization };

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="clinica-section" style={{ background: 'var(--clinica-light)' }}>
            <div className="clinica-container" style={{ maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="clinica-subtitle">Dúvidas Frequentes</span>
                    <h2 className="clinica-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        <EditableText
                            id="clinica_faq_title"
                            defaultText={content.title}
                            tagName="span"
                            {...editProps}
                        />
                    </h2>
                    <p style={{ color: 'var(--clinica-gray)' }}>
                        <EditableText
                            id="clinica_faq_sub"
                            defaultText={content.subtitle}
                            tagName="span"
                            {...editProps}
                        />
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {content.items.map((item, idx) => (
                        <div
                            key={idx}
                            className="glass-panel"
                            style={{
                                overflow: 'hidden',
                                background: openIndex === idx ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                                transition: 'all 0.3s ease',
                                border: '1px solid rgba(255,255,255,0.6)'
                            }}
                        >
                            <button
                                onClick={() => toggleAccordion(idx)}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: 'var(--clinica-dark)'
                                }}>
                                    <EditableText
                                        id={`clinica_faq_q_${idx}`}
                                        defaultText={item.question}
                                        tagName="span"
                                        {...editProps}
                                    />
                                </span>
                                <span style={{ color: 'var(--clinica-primary)', display: 'flex' }}>
                                    {openIndex === idx ? <Minus size={20} /> : <Plus size={20} />}
                                </span>
                            </button>

                            <div
                                style={{
                                    height: openIndex === idx ? 'auto' : 0,
                                    opacity: openIndex === idx ? 1 : 0,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--clinica-gray)', lineHeight: 1.7 }}>
                                    <EditableText
                                        id={`clinica_faq_a_${idx}`}
                                        defaultText={item.answer}
                                        tagName="p"
                                        {...editProps}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

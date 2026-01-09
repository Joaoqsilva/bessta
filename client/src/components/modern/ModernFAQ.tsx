import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { type ModernContent } from '../../data/modernContent';

export const ModernFAQ = ({ content }: { content: ModernContent['faq'] }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="modern-section bg-white">
            <div className="modern-container" style={{ maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 className="modern-title" style={{ fontSize: '2.5rem' }}>{content.title}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {content.items.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                transition: 'all 0.3s'
                            }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: openIndex === idx ? 'var(--modern-bg)' : 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--modern-heading)' }}>
                                    {item.question}
                                </span>
                                <span style={{
                                    color: openIndex === idx ? 'var(--modern-primary)' : 'var(--modern-text-light)',
                                    background: openIndex === idx ? 'var(--modern-secondary)' : '#f1f5f9',
                                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {openIndex === idx ? <Minus size={18} /> : <Plus size={18} />}
                                </span>
                            </button>

                            <div style={{
                                maxHeight: openIndex === idx ? '500px' : '0',
                                opacity: openIndex === idx ? 1 : 0,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--modern-text)', background: 'var(--modern-bg)' }}>
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

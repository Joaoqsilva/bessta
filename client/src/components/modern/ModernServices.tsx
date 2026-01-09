import { BrainCircuit, Sun, Target, HeartHandshake, Sparkles } from 'lucide-react';
import { type ModernContent } from '../../data/modernContent';

const iconMap: Record<string, any> = {
    BrainCircuit, Sun, Target, HeartHandshake, Sparkles
};

export const ModernServices = ({ content }: { content: ModernContent['services'] }) => {
    return (
        <section id="services" className="modern-section bg-slate">
            <div className="modern-container">
                <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
                    <span className="modern-subtitle">{content.title}</span>
                    <h2 className="modern-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        {content.subtitle}
                    </h2>
                </div>

                <div className="modern-grid-4">
                    {content.items.map((item, idx) => {
                        const Icon = iconMap[item.icon] || Sparkles;
                        return (
                            <div key={idx} className="modern-card" style={{ padding: '2rem 1.5rem', textAlign: 'left' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'var(--modern-secondary)',
                                    color: 'var(--modern-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <Icon size={24} strokeWidth={2} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--modern-heading)' }}>{item.title}</h3>
                                <p style={{ color: 'var(--modern-text-light)', fontSize: '0.95rem' }}>{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

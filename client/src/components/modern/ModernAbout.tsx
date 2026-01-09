import { Check } from 'lucide-react';
import { type ModernContent } from '../../data/modernContent';

export const ModernAbout = ({ content }: { content: ModernContent['about'] }) => {
    return (
        <section id="about" className="modern-section bg-white" style={{ position: 'relative' }}>
            {/* Background Shape */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', background: 'var(--modern-secondary)', opacity: 0.5, borderTopLeftRadius: '100px', borderBottomLeftRadius: '100px', zIndex: 0 }}></div>

            <div className="modern-container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="modern-card">
                    <div className="modern-grid-2" style={{ alignItems: 'center' }}>

                        {/* Image */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                borderRadius: '1.5rem',
                                overflow: 'hidden',
                                aspectRatio: '1/1',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <img src={content.image} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{
                                position: 'absolute',
                                top: '-1rem',
                                left: '-1rem',
                                width: '100px',
                                height: '100px',
                                background: 'var(--modern-primary)',
                                borderRadius: '50%',
                                zIndex: -1,
                                opacity: 0.2
                            }}></div>
                        </div>

                        {/* Content */}
                        <div>
                            <span className="modern-subtitle">{content.subtitle}</span>
                            <h2 className="modern-title" style={{ fontSize: '2.25rem', marginBottom: '1.5rem' }}>
                                {content.title}
                            </h2>
                            <p style={{ color: 'var(--modern-text-light)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                                {content.description}
                            </p>

                            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                                {content.features.map((feature, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 500 }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'var(--modern-secondary)',
                                            color: 'var(--modern-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

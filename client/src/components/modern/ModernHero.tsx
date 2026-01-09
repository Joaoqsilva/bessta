import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { type ModernContent } from '../../data/modernContent';

export const ModernHero = ({ content }: { content: ModernContent['hero'] }) => {
    return (
        <section id="hero" className="modern-section bg-slate" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
            <div className="modern-container">
                <div className="modern-grid-2" style={{ alignItems: 'center', gap: '4rem' }}>

                    {/* Text Content */}
                    <div>
                        <span className="modern-subtitle">{content.subtitle}</span>
                        <h1 className="modern-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                            {content.title}
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--modern-text-light)', marginBottom: '2.5rem' }}>
                            {content.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {content.buttons.map((btn, idx) => (
                                <a
                                    key={idx}
                                    href={btn.link}
                                    className={`modern-btn ${btn.variant === 'primary' ? 'modern-btn-primary' : 'modern-btn-outline'}`}
                                >
                                    {btn.text}
                                    {btn.variant === 'primary' && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
                                </a>
                            ))}
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--modern-text-light)' }}>
                                <CheckCircle2 size={16} color="var(--modern-primary)" /> Atendimento Online
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--modern-text-light)' }}>
                                <CheckCircle2 size={16} color="var(--modern-primary)" /> Primeira Sessão Avaliativa
                            </div>
                        </div>
                    </div>

                    {/* Image / Stats */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'relative',
                            borderRadius: '2rem',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            border: '4px solid white',
                        }}>
                            <img
                                src={content.image}
                                alt="Hero"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>

                        {/* Floating Stats */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-2rem',
                            left: '2rem',
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            boxShadow: 'var(--shadow-lg)',
                            display: 'flex',
                            gap: '2rem',
                            border: '1px solid #e2e8f0',
                            maxWidth: '90%'
                        }} className="hero-stats">
                            {content.stats.map((stat, idx) => (
                                <div key={idx}>
                                    <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--modern-primary)' }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--modern-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .hero-stats { position: relative; bottom: auto; left: auto; margin-top: 1rem; width: 100%; flex-wrap: wrap; }
                    .modern-title { fontSize: 2.25rem !important; }
                }
            `}</style>
        </section>
    );
};

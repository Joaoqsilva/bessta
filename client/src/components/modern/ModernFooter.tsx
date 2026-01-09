import { Instagram, Linkedin } from 'lucide-react';
import { type ModernContent } from '../../data/modernContent';

export const ModernFooter = ({ content }: { content: ModernContent['footer'] }) => {
    return (
        <footer style={{ background: '#0F172A', color: 'white', padding: '5rem 0 2rem 0' }}>
            <div className="modern-container">
                <div className="modern-grid-3" style={{ marginBottom: '4rem' }}>

                    {/* Brand */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--modern-primary)' }}>
                            {content.logo}
                        </h2>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{content.description}</p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Contato & Localização</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8', lineHeight: 2 }}>
                            <li>{content.contact.address}</li>
                            <li>{content.contact.phone}</li>
                            <li>{content.contact.email}</li>
                        </ul>
                    </div>

                    {/* Hours */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Funcionamento</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{content.hours}</p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {content.social.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.url}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: '0.2s'
                                    }}
                                    className="hover-bg-primary"
                                >
                                    {social.platform === 'Instagram' && <Instagram size={20} />}
                                    {social.platform === 'LinkedIn' && <Linkedin size={20} />}
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    {content.copyright}
                </div>
            </div>
            <style>{`
                .hover-bg-primary:hover { background: var(--modern-primary) !important; }
            `}</style>
        </footer>
    );
};

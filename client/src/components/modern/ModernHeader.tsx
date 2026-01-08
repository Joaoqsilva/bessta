import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { type ModernContent } from '../../data/modernContent';

export const ModernHeader = ({ content }: { content: ModernContent['header'] }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <header style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div className="modern-container" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--modern-primary)' }}>
                    {content.logo}
                </div>

                {/* Desktop Nav */}
                <nav className="desktop-nav" style={{ display: 'none' }}>
                    <ul style={{ display: 'flex', gap: '2rem', alignItems: 'center', margin: 0, padding: 0, listStyle: 'none' }}>
                        {content.menuItems.map((item, idx) => (
                            <li key={idx}>
                                <a
                                    href={item.anchor}
                                    style={{
                                        color: 'var(--modern-text)',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}
                                    className="hover-primary"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a href="#booking" className="modern-btn modern-btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                                {content.ctaText}
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--modern-heading)' }}
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMobileOpen && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {content.menuItems.map((item, idx) => (
                            <li key={idx}>
                                <a
                                    href={item.anchor}
                                    onClick={() => setIsMobileOpen(false)}
                                    style={{ color: 'var(--modern-text)', fontWeight: 500, textDecoration: 'none', display: 'block', padding: '0.5rem 0' }}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a
                                href="#booking"
                                className="modern-btn modern-btn-primary"
                                style={{ width: '100%', textAlign: 'center' }}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                {content.ctaText}
                            </a>
                        </li>
                    </ul>
                </div>
            )}

            <style>{`
                @media (min-width: 768px) {
                    .desktop-nav { display: block !important; }
                    .mobile-toggle { display: none !important; }
                }
                .hover-primary:hover { color: var(--modern-primary) !important; }
            `}</style>
        </header>
    );
};

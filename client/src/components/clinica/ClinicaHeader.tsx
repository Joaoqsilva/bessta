import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaHeaderProps {
    content: ClinicaContent['header'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
    onBook?: () => void;
}

export const ClinicaHeader = ({ content, isEditorMode, onEditAction, customization, onBook }: ClinicaHeaderProps) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.querySelector(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const editProps = { isEditorMode, onEditAction, customization };
    // Use customization name if available (which comes from props), fallback to static content
    const logoText = content.logo;

    return (
        <header
            className={`clinica-header ${isScrolled ? 'scrolled' : ''}`}
            style={{

                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                transition: 'all 0.3s ease',
                padding: isScrolled ? '1rem 0' : '2rem 0',
                background: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.3)' : 'none',
                boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.05)' : 'none',
            }}
        >
            <div className="clinica-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Logo */}
                <div className="logo" style={{ zIndex: 1001 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--clinica-primary)',
                        margin: 0
                    }}>
                        <EditableText
                            id="clinica_logo"
                            defaultText={logoText}
                            tagName="span"
                            {...editProps}
                        />
                    </h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="desktop-nav" style={{ display: 'none' }}>
                    <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
                        {content.menuItems.map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.anchor}
                                    onClick={(e) => scrollToSection(e, item.anchor)}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'var(--clinica-dark)',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        transition: 'color 0.2s',
                                        position: 'relative'
                                    }}
                                    className="nav-link"
                                >

                                    <EditableText
                                        id={`clinica_nav_${index}`}
                                        defaultText={item.label}
                                        tagName="span"
                                        {...editProps}
                                    />
                                </a>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={onBook}
                                className="clinica-btn clinica-btn-primary"
                                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                            >
                                <EditableText
                                    id="clinica_cta"
                                    defaultText={content.ctaText}
                                    tagName="span"
                                    {...editProps}
                                />
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--clinica-primary)',
                        cursor: 'pointer',
                        zIndex: 1001,
                        display: 'flex'
                    }}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Navigation Overlay */}
                <div
                    className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: '100vh',
                        background: 'rgba(250, 250, 249, 0.98)',
                        backdropFilter: 'blur(10px)',
                        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {content.menuItems.map((item, index) => (
                            <li key={index} style={{ opacity: isMobileMenuOpen ? 1 : 0, transition: `opacity 0.3s ease ${index * 0.1}s` }}>
                                <a
                                    href={item.anchor}
                                    onClick={(e) => scrollToSection(e, item.anchor)}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'var(--clinica-primary)',
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '2rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    <EditableText
                                        id={`clinica_nav_mobile_${index}`}
                                        defaultText={item.label}
                                        tagName="span"
                                        {...editProps}
                                    />
                                </a>
                            </li>
                        ))}
                        <li style={{ marginTop: '1rem', opacity: isMobileMenuOpen ? 1 : 0, transition: `opacity 0.3s ease ${content.menuItems.length * 0.1}s` }}>
                            <button className="clinica-btn clinica-btn-primary" onClick={() => { setIsMobileMenuOpen(false); if (onBook) onBook(); }}>
                                <EditableText
                                    id="clinica_cta_mobile"
                                    defaultText={content.ctaText}
                                    tagName="span"
                                    {...editProps}
                                />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .mobile-toggle { display: none !important; }
                    .mobile-nav { display: none !important; }
                    .desktop-nav { display: block !important; }
                }
                .nav-link:hover { color: var(--clinica-primary) !important; }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: -4px;
                    left: 0;
                    background-color: var(--clinica-accent);
                    transition: width 0.3s ease;
                }
                .nav-link:hover::after { width: 100%; }
            `}</style>
        </header>
    );
};

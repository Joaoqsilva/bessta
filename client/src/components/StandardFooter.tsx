import { Star, MapPin, Phone, Mail, Clock, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { EditableText } from './EditableText';
import { EditableSocialLink, SOCIAL_NETWORKS } from './EditableSocialLink';
import { StoreFooterRating } from './StoreFooterRating';
import type { StoreCustomization, SocialLink } from '../types';

interface StandardFooterProps {
    storeName: string;
    storeId?: string;
    rating?: number;
    totalReviews?: number;
    customization?: StoreCustomization;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    primaryColor?: string;
    accentColor?: string;
    bgColor?: string;
    textColor?: string;
}

export const StandardFooter = ({
    storeName,
    storeId = 'demo',
    rating,
    totalReviews,
    customization,
    isEditorMode = false,
    onEditAction,
    primaryColor = '#5c9ece',
    accentColor = '#e0b080',
    bgColor,
    textColor = '#ffffff'
}: StandardFooterProps) => {
    const editProps = { isEditorMode, onEditAction, customization };

    // Use customization colors or fallback
    const footerBg = bgColor || customization?.primaryColor || primaryColor;
    const footerText = textColor;
    const accent = customization?.accentColor || accentColor;

    // Default social links (Instagram, LinkedIn, WhatsApp)
    const socialLinks: SocialLink[] = customization?.socialLinks || [];

    // Navigation links based on layout sections
    const navLinks = [
        { id: 'inicio', label: 'Início', href: '#' },
        { id: 'sobre', label: 'Sobre', href: '#about' },
        { id: 'servicos', label: 'Serviços', href: '#services' },
        { id: 'galeria', label: 'Galeria', href: '#gallery' },
        { id: 'duvidas', label: 'Dúvidas', href: '#faq' },
    ];

    return (
        <footer
            className="standard-footer"
            style={{
                '--footer-bg': footerBg,
                '--footer-text': footerText,
                '--footer-accent': accent,
            } as React.CSSProperties}
        >
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Column 1: Brand Info */}
                    <div className="footer-brand">
                        <h3 className="footer-logo">
                            <EditableText
                                id="footer_logo"
                                defaultText={storeName}
                                tagName="span"
                                {...editProps}
                            />
                        </h3>
                        <p className="footer-description">
                            <EditableText
                                id="footer_desc"
                                defaultText="Clínica de referência em psicanálise e saúde mental."
                                tagName="span"
                                {...editProps}
                            />
                        </p>

                        {/* Social Icons */}
                        <div className="footer-social">
                            {socialLinks.length > 0 ? (
                                <EditableSocialLink
                                    id="footer_social"
                                    links={socialLinks}
                                    isEditorMode={isEditorMode}
                                    onUpdateLinks={(links) => onEditAction?.('socialLinks', JSON.stringify(links))}
                                    iconSize={22}
                                    iconClassName="footer-social-icon"
                                />
                            ) : isEditorMode ? (
                                // Default icons only in editor mode to encourage configuration
                                <div className="flex gap-3">
                                    <button
                                        className="footer-social-icon"
                                        onClick={() => onEditAction?.('socialLinks', '[]')}
                                        title="Configurar Redes Sociais"
                                    >
                                        <Instagram size={22} />
                                    </button>
                                    <button
                                        className="footer-social-icon"
                                        onClick={() => onEditAction?.('socialLinks', '[]')}
                                        title="Configurar Redes Sociais"
                                    >
                                        <Linkedin size={22} />
                                    </button>
                                    <button
                                        className="footer-social-icon"
                                        onClick={() => onEditAction?.('socialLinks', '[]')}
                                        title="Configurar Redes Sociais"
                                    >
                                        <MessageCircle size={22} />
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {/* Rating */}
                        <div className="footer-rating">
                            <StoreFooterRating
                                storeId={storeId}
                                rating={rating}
                                totalReviews={totalReviews}
                                color={accent}
                                textColor={footerText}
                                isEditorMode={isEditorMode}
                            />
                        </div>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="footer-nav">
                        <h4 className="footer-title">
                            <EditableText
                                id="footer_nav_title"
                                defaultText="Navegação"
                                tagName="span"
                                {...editProps}
                            />
                        </h4>
                        <ul className="footer-links">
                            {navLinks.map((link, idx) => (
                                <li key={link.id}>
                                    <a href={link.href}>
                                        <EditableText
                                            id={`footer_nav_${idx}`}
                                            defaultText={link.label}
                                            tagName="span"
                                            {...editProps}
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="footer-contact">
                        <h4 className="footer-title">
                            <EditableText
                                id="footer_contact_title"
                                defaultText="Contato"
                                tagName="span"
                                {...editProps}
                            />
                        </h4>

                        <div className="footer-contact-list">
                            <div className="footer-contact-item">
                                <MapPin size={18} style={{ color: accent }} />
                                <EditableText
                                    id="footer_address"
                                    defaultText="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                                    tagName="span"
                                    {...editProps}
                                />
                            </div>
                            <div className="footer-contact-item">
                                <Phone size={18} style={{ color: accent }} />
                                <EditableText
                                    id="footer_phone"
                                    defaultText="(47) 99139-4589"
                                    tagName="span"
                                    {...editProps}
                                />
                            </div>
                            <div className="footer-contact-item">
                                <Mail size={18} style={{ color: accent }} />
                                <EditableText
                                    id="footer_email"
                                    defaultText="contato@clinica.com.br"
                                    tagName="span"
                                    {...editProps}
                                />
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="footer-hours">
                            <div className="footer-hours-label">
                                <Clock size={14} style={{ color: accent }} />
                                <EditableText
                                    id="footer_hours_label"
                                    defaultText="Horário de Atendimento:"
                                    tagName="span"
                                    {...editProps}
                                />
                            </div>
                            <p className="footer-hours-time">
                                <EditableText
                                    id="footer_hours"
                                    defaultText="Segunda a Sexta: 08h às 20h"
                                    tagName="span"
                                    {...editProps}
                                />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} {storeName}.
                        <EditableText
                            id="footer_copyright"
                            defaultText=" Todos os direitos reservados."
                            tagName="span"
                            {...editProps}
                        />
                    </p>
                </div>
            </div>

            <style>{`
                .standard-footer {
                    background: var(--footer-bg);
                    color: var(--footer-text);
                    padding: 4rem 0 0;
                    font-family: inherit;
                }

                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr 1.5fr;
                    gap: 3rem;
                    padding-bottom: 3rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                        text-align: center;
                    }
                }

                .footer-logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    display: block;
                }

                .footer-description {
                    opacity: 0.8;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .footer-social {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 768px) {
                    .footer-social {
                        justify-content: center;
                    }
                }

                .footer-social-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    color: var(--footer-text);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .footer-social-icon:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: var(--footer-accent);
                    color: var(--footer-accent);
                }

                .footer-rating {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                @media (max-width: 768px) {
                    .footer-rating {
                        justify-content: center;
                    }
                }

                .footer-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1.25rem;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-links li {
                    margin-bottom: 0.75rem;
                }

                .footer-links a {
                    color: var(--footer-text);
                    opacity: 0.8;
                    text-decoration: none;
                    font-size: 0.95rem;
                    transition: opacity 0.2s;
                }

                .footer-links a:hover {
                    opacity: 1;
                    color: var(--footer-accent);
                }

                .footer-contact-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.875rem;
                    margin-bottom: 1.5rem;
                }

                .footer-contact-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    font-size: 0.95rem;
                    opacity: 0.9;
                }

                @media (max-width: 768px) {
                    .footer-contact-item {
                        justify-content: center;
                    }
                }

                .footer-hours {
                    background: rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    border-left: 3px solid var(--footer-accent);
                }

                .footer-hours-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    opacity: 0.7;
                    margin-bottom: 0.25rem;
                }

                @media (max-width: 768px) {
                    .footer-hours-label {
                        justify-content: center;
                    }
                }

                .footer-hours-time {
                    font-weight: 600;
                    font-size: 1rem;
                }

                .footer-bottom {
                    text-align: center;
                    padding: 1.5rem 0;
                    font-size: 0.875rem;
                    opacity: 0.7;
                }
            `}</style>
        </footer>
    );
};

import { Instagram, Linkedin, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';
import { type ClinicaContent } from '../../data/clinicaContent';
import { EditableText } from '../EditableText';
import { type StoreCustomization } from '../../context/StoreCustomizationService';

interface ClinicaFooterProps {
    content: ClinicaContent['footer'];
    navItems: ClinicaContent['header']['menuItems'];
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
    customization?: StoreCustomization;
}

export const ClinicaFooter = ({ content, navItems, isEditorMode, onEditAction, customization }: ClinicaFooterProps) => {
    const editProps = { isEditorMode, onEditAction, customization };

    // In a full implementation, social links and contact info would also come from customization store settings.
    return (
        <footer style={{ background: 'var(--clinica-primary)', color: 'var(--clinica-light)', paddingTop: '4rem' }}>
            <div className="clinica-container">
                <div className="grid-4" style={{ gap: '3rem', marginBottom: '3rem' }}>

                    {/* Brand */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--clinica-secondary)' }}>
                            <EditableText
                                id="clinica_foot_logo"
                                defaultText={content.logo}
                                tagName="span"
                                {...editProps}
                            />
                        </h2>
                        <div style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            <EditableText
                                id="clinica_foot_desc"
                                defaultText={content.description}
                                tagName="p"
                                {...editProps}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {content.social.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.url}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        transition: 'background 0.3s'
                                    }}
                                    className="social-link"
                                >
                                    {social.platform === 'Instagram' && <Instagram size={20} />}
                                    {social.platform === 'LinkedIn' && <Linkedin size={20} />}
                                    {social.platform === 'WhatsApp' && <MessageCircle size={20} />}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Navegação</h3>
                        <ul style={{ listStyle: 'none', padding: 0, opacity: 0.9 }}>
                            {navItems.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '0.8rem' }}>
                                    <a href={item.anchor} style={{ color: 'inherit', textDecoration: 'none', transition: 'opacity 0.2s' }} className="footer-link">
                                        <EditableText
                                            id={`clinica_foot_nav_${idx}`}
                                            defaultText={item.label}
                                            tagName="span"
                                            {...editProps}
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Contato</h3>
                        <ul style={{ listStyle: 'none', padding: 0, opacity: 0.9 }}>
                            <li style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                <MapPin size={20} style={{ color: 'var(--clinica-accent)', flexShrink: 0 }} />
                                <span>{content.contact.address}</span>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <Phone size={20} style={{ color: 'var(--clinica-accent)', flexShrink: 0 }} />
                                <span>{content.contact.phone}</span>
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <Mail size={20} style={{ color: 'var(--clinica-accent)', flexShrink: 0 }} />
                                <span>{content.contact.email}</span>
                            </li>
                            <li style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clinica-accent)', marginBottom: '0.2rem' }}>Horário de Atendimento</span>
                                <EditableText
                                    id="clinica_foot_hours"
                                    defaultText={content.hours}
                                    tagName="span"
                                    {...editProps}
                                />
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '2rem 0', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
                    <EditableText
                        id="clinica_foot_copy"
                        defaultText={content.copyright}
                        tagName="span"
                        {...editProps}
                    />
                </div>
            </div>

            <style>{`
                .social-link:hover { background: var(--clinica-accent) !important; }
                .footer-link:hover { opacity: 0.7; }
                @media (min-width: 768px) {
                    div[style*="gridColumn: 'span 2'"] { grid-column: span 1 !important; }
                }
            `}</style>
        </footer>
    );
};

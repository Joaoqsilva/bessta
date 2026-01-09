import { useEffect } from 'react';
import { clinicaData } from '../../data/clinicaContent';
import { type StoreCustomization } from '../../context/StoreCustomizationService';
import { ClinicaHeader } from '../../components/clinica/ClinicaHeader';
import { ClinicaHero } from '../../components/clinica/ClinicaHero';
import { ClinicaAbout } from '../../components/clinica/ClinicaAbout';
import { ClinicaGallery } from '../../components/clinica/ClinicaGallery';
import { ClinicaServices } from '../../components/clinica/ClinicaServices';
import { ClinicaFAQ } from '../../components/clinica/ClinicaFAQ';
import { ClinicaFooter } from '../../components/clinica/ClinicaFooter';

import '../../styles/clinica.css';

interface LandingPageProps {
    store?: any;
    customization?: StoreCustomization;
    onBook?: () => void;
    isEditorMode?: boolean;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const LandingPageNew = ({ store, customization, onBook, isEditorMode, onEditAction }: LandingPageProps = {}) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Merge static data with dynamic customization defaults or overrides where applicable
    // Note: The child components now prioritize 'customization' prop for their defaults
    // but we still pass basic structure from clinicaData if needed.
    const content = {
        ...clinicaData,
        header: {
            ...clinicaData.header,
            logo: store?.name || clinicaData.header.logo,
        }
    };

    // Override colors if customization exists
    const dynamicStyle = customization ? {
        '--clinica-primary': customization.primaryColor,
        '--clinica-accent': customization.accentColor,
    } as React.CSSProperties : {};

    const commonProps = { isEditorMode, onEditAction, customization };

    return (
        <div className="clinica-theme" style={dynamicStyle}>
            <ClinicaHeader content={content.header} onBook={onBook} {...commonProps} />

            <main>
                <ClinicaHero content={content.hero} onBook={onBook} {...commonProps} />
                <ClinicaAbout content={content.about} {...commonProps} />
                <ClinicaServices content={content.services} {...commonProps} />
                <ClinicaGallery content={content.gallery} {...commonProps} />
                <ClinicaFAQ content={content.faq} {...commonProps} />
            </main>

            <ClinicaFooter content={content.footer} navItems={content.header.menuItems} {...commonProps} />
        </div>
    );
};

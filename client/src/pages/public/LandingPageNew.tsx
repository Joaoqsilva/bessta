import { useEffect } from 'react';
import { clinicaData } from '../../data/clinicaContent';
import { type StoreCustomization } from '../../context/StoreCustomizationService';
import { ClinicaHeader } from '../../components/clinica/ClinicaHeader';
import { ClinicaHero } from '../../components/clinica/ClinicaHero';
import { ClinicaAbout } from '../../components/clinica/ClinicaAbout';
import { ClinicaGallery } from '../../components/clinica/ClinicaGallery';
import { ClinicaServices } from '../../components/clinica/ClinicaServices';
import { ClinicaFAQ } from '../../components/clinica/ClinicaFAQ';
import { StandardFooter } from '../../components/StandardFooter';

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

        // Auto-populate defaults in Editor Mode if empty
        if (isEditorMode && onEditAction) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                const defaultServices = clinicaData.services.items;
                onEditAction('init-services__', JSON.stringify(defaultServices));
            }
            if (!customization?.faq || customization.faq.length === 0) {
                const defaultFaq = clinicaData.faq.items;
                onEditAction('init-faq__', JSON.stringify(defaultFaq));
            }
        }
    }, [isEditorMode]);

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
        '--clinica-active': customization.primaryColor, // Ensure consistent primary color usage
        '--clinica-accent': customization.accentColor,
        '--clinica-icon': customization.iconColor || customization.primaryColor,
    } as React.CSSProperties : {};

    const commonProps = { isEditorMode, onEditAction, customization };

    return (
        <div className="clinica-theme" style={dynamicStyle}>
            <ClinicaHeader content={content.header} onBook={onBook} {...commonProps} storeId={store?._id || store?.id} />

            <main>
                {customization?.visibleSections?.['hero'] !== false && <ClinicaHero content={content.hero} onBook={onBook} {...commonProps} />}
                {customization?.visibleSections?.['about'] !== false && <ClinicaAbout content={content.about} {...commonProps} />}
                {customization?.visibleSections?.['services'] !== false && <ClinicaServices content={content.services} {...commonProps} />}
                {customization?.visibleSections?.['gallery'] !== false && <ClinicaGallery content={content.gallery} {...commonProps} />}
                {customization?.visibleSections?.['faq'] !== false && <ClinicaFAQ content={content.faq} {...commonProps} />}
            </main>

            <StandardFooter
                storeName={store?.name || content.header.logo}
                storeId={store?._id || store?.id}
                rating={store?.rating}
                totalReviews={store?.totalReviews}
                customization={customization}
                isEditorMode={isEditorMode}
                onEditAction={onEditAction}
                primaryColor="var(--clinica-primary)"
                accentColor="var(--clinica-accent)"
                textColor="#333333"
                bgColor="#F5E6D3"
            />
        </div>
    );
};

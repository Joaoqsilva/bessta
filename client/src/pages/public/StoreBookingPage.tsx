import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useStoreBySlug, type UserStore } from '../../context/AuthContext';
import {
    getCustomizationBySlug,
    type StoreCustomization,
    DEFAULT_CUSTOMIZATION
} from '../../context/StoreCustomizationService';
import type { Store, Service, Appointment } from '../../types';
import './StoreBookingPage.css';
import { LandingPagePsychology } from './LandingPagePsychology';
import { LandingPageBeautySalon } from './LandingPageBeautySalon';
import { LandingPageModern } from './LandingPageModern';
import { LandingPageSophisticated } from './LandingPageSophisticated';
import { LandingPageNew } from './LandingPageNew';
import { BookingWizard } from '../../components/BookingWizard';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];



// Demo store for urban-styles (works independently)
const DEMO_STORE: Store = {
    id: 'demo-urban-styles',
    slug: 'urban-styles',
    name: 'Urban Styles Barbearia',
    description: 'A melhor barbearia urbana da cidade. Cortes modernos e atendimento de primeira.',
    category: 'Barbearia',
    address: 'Rua das Flores, 123 - Centro, São Paulo',
    phone: '(11) 99999-9999',
    email: 'contato@urbanstyles.com',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200',
    ownerId: 'demo',
    ownerName: 'Demo Owner',
    services: [],
    workingHours: [],
    rating: 4.9,
    totalReviews: 127,
    status: 'active',
    createdAt: new Date().toISOString(),
};

const DEMO_SERVICES: Service[] = [
    { id: 1, name: 'Corte Clássico', description: 'Corte tradicional com acabamento perfeito', duration: 30, durationDisplay: '30 min', price: 45, currency: 'BRL', isActive: true },
    { id: 2, name: 'Corte + Barba', description: 'Combo completo para o homem moderno', duration: 60, durationDisplay: '60 min', price: 75, currency: 'BRL', isActive: true },
    { id: 3, name: 'Barba Completa', description: 'Modelagem e hidratação da barba', duration: 30, durationDisplay: '30 min', price: 35, currency: 'BRL', isActive: true },
    { id: 4, name: 'Corte Degradê', description: 'Fade moderno com design personalizado', duration: 45, durationDisplay: '45 min', price: 55, currency: 'BRL', isActive: true },
    { id: 5, name: 'Tratamento Capilar', description: 'Hidratação profunda e massagem', duration: 45, durationDisplay: '45 min', price: 65, currency: 'BRL', isActive: true },
];

interface StoreBookingPageProps {
    isEditorMode?: boolean;
    customizationOverride?: StoreCustomization | null;
    storeOverride?: UserStore | null;
    onEditAction?: (section: string, defaultValue?: string) => void;
}

export const StoreBookingPage = ({
    isEditorMode = false,
    customizationOverride,
    storeOverride,
    onEditAction
}: StoreBookingPageProps = {}) => {
    const { slug: paramsSlug } = useParams();
    // If we have an override, use its slug, otherwise use params
    const slug = storeOverride?.slug || paramsSlug;
    const isDemo = slug === 'urban-styles';

    // Only fetch if we don't have an override AND it's not the special demo case (unless we want to try fetching demo from backend too)
    // Actually, 'urban-styles' is hardcoded demo in frontend, so we can skip fetch or ignore error
    const { store: fetchedStore, isLoading, error } = useStoreBySlug(isDemo ? '' : (slug || ''));

    // Resolve which store to use
    const store = useMemo(() => {
        if (storeOverride) return storeOverride;
        if (isDemo) return DEMO_STORE;
        return fetchedStore;
    }, [isDemo, storeOverride, fetchedStore]);

    const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
    const [customization, setCustomization] = useState<StoreCustomization | null>(customizationOverride || null);

    useEffect(() => {
        let isMounted = true;

        const loadCustomization = async () => {
            // If manual override (preview mode), use it
            if (customizationOverride) {
                if (isMounted) setCustomization(customizationOverride);
                return;
            }

            try {
                // Otherwise fetch from API
                if (slug) {
                    const saved = await getCustomizationBySlug(slug);
                    if (isMounted) {
                        if (saved) {
                            setCustomization(saved);
                        } else {
                            // Fallback default
                            setCustomization({
                                storeId: store?.id || '',
                                ...DEFAULT_CUSTOMIZATION,
                                layout: 'psychology-office'
                            });
                        }
                    }
                } else if (store?.id) {
                    // Fallback if no slug but store ID
                    if (isMounted) {
                        setCustomization({
                            storeId: store.id,
                            ...DEFAULT_CUSTOMIZATION
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading customization", err);
                if (isMounted) {
                    // Emergency fallback
                    setCustomization({
                        storeId: store?.id || '',
                        ...DEFAULT_CUSTOMIZATION
                    });
                }
            }
        };

        // Run if we have store or override
        if (store?.id || customizationOverride || isDemo) {
            loadCustomization();
        }

        return () => { isMounted = false; };
    }, [slug, customizationOverride, store?.id, isDemo]);


    const handleStartBooking = () => {
        setIsBookingWizardOpen(true);
    };

    // Apply custom CSS from customization
    useEffect(() => {
        if (customization) {
            const root = isEditorMode ? document.querySelector('.visual-editor-preview-container') as HTMLElement : document.documentElement;
            // Fallback to documentElement if wrapper not found (shouldn't happen in editor) or normal mode
            const target = root || document.documentElement;

            target.style.setProperty('--store-primary', customization.primaryColor);
            target.style.setProperty('--store-secondary', customization.secondaryColor);
            target.style.setProperty('--store-accent', customization.accentColor);

            // Apply font family
            const fontMap: Record<string, string> = {
                'inter': 'Inter, sans-serif',
                'poppins': 'Poppins, sans-serif',
                'roboto': 'Roboto, sans-serif',
                'outfit': 'Outfit, sans-serif',
            };
            const fontFamily = fontMap[customization.fontFamily] || fontMap['inter'];
            target.style.setProperty('--store-font', fontFamily);
        }

        // No cleanup needed for editor mode as updates are continuous
        // For normal mode, we might want cleanup on unmount
        if (!isEditorMode) {
            return () => {
                document.documentElement.style.removeProperty('--store-primary');
                document.documentElement.style.removeProperty('--store-secondary');
                document.documentElement.style.removeProperty('--store-accent');
                document.documentElement.style.removeProperty('--store-font');
            };
        }
    }, [customization, isEditorMode]);


    // Clean Render Logic
    if (isLoading && !store && !customizationOverride && !isDemo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    if (error && !store && !customizationOverride && !isDemo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Loja não encontrada</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    if (!store || !customization) {
        // Still initializing defaults or something wrong
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    let LayoutComponent: any = LandingPageBeautySalon; // Default fallback

    if (customization.layout === 'psychology-office') {
        LayoutComponent = LandingPagePsychology;
    } else if (customization.layout === 'beauty-salon') {
        LayoutComponent = LandingPageBeautySalon;
    } else if (customization.layout === 'modern-therapy') {
        LayoutComponent = LandingPageModern;
    } else if (customization.layout === 'sophisticated-therapy') {
        LayoutComponent = LandingPageSophisticated;
    } else if (customization.layout === 'lacanian-clinic') {
        LayoutComponent = LandingPageNew;
    }

    return (
        <div className={`booking-page layout-${customization.layout}`}>
            <LayoutComponent
                store={store}
                customization={customization}
                onBook={handleStartBooking}
                isEditorMode={isEditorMode}
                onEditAction={onEditAction}
            />

            {/* Booking Wizard Modal */}
            <BookingWizard
                store={store as any}
                customization={customization}
                isOpen={isBookingWizardOpen}
                onClose={() => setIsBookingWizardOpen(false)}
            />
        </div>
    );
};

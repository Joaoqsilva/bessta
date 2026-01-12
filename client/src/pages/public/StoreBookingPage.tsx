import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { ChatWidget } from '../../components/ChatWidget';
import { useStoreBySlug, type UserStore } from '../../context/AuthContext';
import {
    getCustomizationBySlug,
    type StoreCustomization,
    DEFAULT_CUSTOMIZATION
} from '../../context/StoreCustomizationService';
import type { Store, Service, Appointment } from '../../types';
import './StoreBookingPage.css';
import { LandingPagePsychology } from './LandingPagePsychology'; // Still keep potentially if needed but likely removing usage logic
import { LandingPageBeautySalon } from './LandingPageBeautySalon'; // Keep for now until full confirmation or delete file
import { LandingPageModern } from './LandingPageModern';
import { LandingPageSophisticated } from './LandingPageSophisticated';
import { LandingPageNew } from './LandingPageNew';
import { LandingPageTherapy } from './LandingPageTherapy';
import { LandingPageClinic } from './LandingPageClinic';
import { LandingPageHarmony } from './LandingPageHarmony';
import { LandingPageVibrant } from './LandingPageVibrant';
import { LandingPageSunny } from './LandingPageSunny';
import { LandingPageVitality } from './LandingPageVitality';
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
                                layout: 'therapy-new'
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
            const applyVariables = (target: HTMLElement) => {
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
            };

            const root = document.documentElement;
            applyVariables(root);

            // Also apply to body to be safe
            applyVariables(document.body);

            // If in editor mode, try to find the specific container
            if (isEditorMode) {
                const previewContainer = document.querySelector('.visual-editor-preview-container') as HTMLElement;
                if (previewContainer) {
                    applyVariables(previewContainer);
                }
            }
        }

        // Cleanup
        return () => {
            if (!isEditorMode) {
                const removeVariables = (target: HTMLElement) => {
                    target.style.removeProperty('--store-primary');
                    target.style.removeProperty('--store-secondary');
                    target.style.removeProperty('--store-accent');
                    target.style.removeProperty('--store-font');
                };
                removeVariables(document.documentElement);
                removeVariables(document.body);
            }
        };
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

    let LayoutComponent: any = LandingPageTherapy; // Default new fallback (was BeautySalon)

    if (customization.layout === 'modern-therapy') {
        LayoutComponent = LandingPageModern;
    } else if (customization.layout === 'sophisticated-therapy') {
        LayoutComponent = LandingPageSophisticated;
    } else if (customization.layout === 'lacanian-clinic') {
        LayoutComponent = LandingPageNew;
    } else if (customization.layout === 'therapy-new') {
        LayoutComponent = LandingPageTherapy; // Layout Terapia (Novo)
    } else if (customization.layout === 'clinic-new') {
        LayoutComponent = LandingPageClinic; // Layout Clinica (Novo)
    } else if (customization.layout === 'harmony-new') {
        LayoutComponent = LandingPageHarmony; // Layout Harmony (Novo)
    } else if (customization.layout === 'vibrant-new') {
        LayoutComponent = LandingPageVibrant; // Layout Vibrant (Novo)
    } else if (customization.layout === 'sunny-new') {
        LayoutComponent = LandingPageSunny; // Layout Sunny (Novo)
    } else if (customization.layout === 'vitality-new') {
        LayoutComponent = LandingPageVitality; // Layout Vitality (Novo)
    }

    return (
        <div className={`booking-page layout-${customization.layout} ${isEditorMode ? 'is-editor' : ''}`}>
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

            <ChatWidget
                mode="store"
                storeId={store.id}
                storeName={store.name}
                storePhone={store.phone}
            />
        </div>
    );
};

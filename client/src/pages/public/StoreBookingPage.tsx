import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
// import { ChatWidget } from '../../components/ChatWidget'; // Temporariamente desabilitado
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




// Demo store - Psicóloga Mariana Costa (Sunny Day Layout)
const DEMO_STORE: Store = {
    id: 'demo-mariana-psi',
    slug: 'psicologa-mariana',
    name: 'Psicóloga Mariana Costa',
    description: 'Psicóloga clínica especializada em ansiedade, autoestima e desenvolvimento pessoal. Atendimento humanizado e acolhedor para você encontrar seu equilíbrio.',
    category: 'Psicologia',
    address: 'Av. Brasil, 2500 - Sala 401, Centro - Blumenau/SC',
    phone: '(47) 99139-4589',
    email: 'contato@psicologamariana.com.br',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800', // Foto profissional da psicóloga
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', // Consultório moderno
    ownerId: 'demo',
    ownerName: 'Mariana Costa',
    services: [],
    workingHours: [],
    rating: 4.9,
    totalReviews: 87,
    status: 'active',
    createdAt: new Date().toISOString(),
};

const DEMO_SERVICES: Service[] = [
    { id: 1, name: 'Terapia Individual', description: 'Sessões de 50 minutos focadas no seu desenvolvimento pessoal e bem-estar emocional', duration: 50, durationDisplay: '50 min', price: 180, currency: 'BRL', isActive: true },
    { id: 2, name: 'Terapia de Casal', description: 'Sessões para fortalecer a comunicação e resolver conflitos no relacionamento', duration: 75, durationDisplay: '1h15', price: 280, currency: 'BRL', isActive: true },
    { id: 3, name: 'Orientação Parental', description: 'Suporte e estratégias para desafios na criação dos filhos', duration: 50, durationDisplay: '50 min', price: 180, currency: 'BRL', isActive: true },
    { id: 4, name: 'Avaliação Psicológica', description: 'Avaliação completa para autoconhecimento e direcionamento terapêutico', duration: 90, durationDisplay: '1h30', price: 350, currency: 'BRL', isActive: true },
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
    const isDemo = slug === 'psicologa-mariana';

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
                            // Fallback default - Sunny Day Layout para demo com conteúdo completo
                            const demoCustomization = {
                                storeId: store?.id || '',
                                ...DEFAULT_CUSTOMIZATION,
                                layout: 'sunny-new',
                                // Fotos profissionais realistas
                                coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', // Consultório moderno e acolhedor
                                aboutImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800', // Mulher profissional sorrindo
                                // Textos personalizados
                                welcomeTitle: 'Encontre seu equilíbrio emocional',
                                welcomeMessage: 'Atendimento psicológico humanizado e acolhedor. Juntas, vamos cuidar da sua saúde mental.',
                                // Serviços
                                servicesList: [
                                    { title: "Terapia Individual", description: "Sessões personalizadas de 50 minutos para trabalhar suas questões emocionais." },
                                    { title: "Terapia de Casal", description: "Espaço seguro para melhorar a comunicação e fortalecer o relacionamento." },
                                    { title: "Orientação Parental", description: "Suporte especializado para os desafios da maternidade e paternidade." }
                                ],
                                // Depoimentos com fotos reais
                                testimonials: [
                                    { text: '"A Mariana me ajudou a superar minha ansiedade de uma forma que nunca imaginei ser possível. Recomendo demais!"', author: "Carolina M.", role: "Paciente há 1 ano", rating: 5 },
                                    { text: '"Finalmente encontrei uma profissional que me escuta de verdade. As sessões são transformadoras."', author: "Rafael S.", role: "Paciente há 8 meses", rating: 5 },
                                    { text: '"Depois de anos tentando, foi com a Mariana que consegui entender e trabalhar minha autoestima."', author: "Juliana P.", role: "Paciente há 2 anos", rating: 5 }
                                ],
                                testimonialImages: [
                                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', // Mulher jovem sorrindo natural
                                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', // Homem casual sorrindo
                                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'  // Mulher natural retrato
                                ],
                                // FAQ
                                faq: [
                                    { question: "Como funciona a primeira sessão?", answer: "Na primeira sessão, conversamos sobre suas expectativas, histórico e principais demandas. É um momento de acolhimento e sem compromisso." },
                                    { question: "Qual a duração e valor das sessões?", answer: "As sessões de terapia individual têm 50 minutos e custam R$ 180. Terapia de casal tem duração de 1h15 por R$ 280." },
                                    { question: "Você atende por plano de saúde?", answer: "Não atendo diretamente por convênio, mas emito nota fiscal e documentação completa para você solicitar reembolso ao seu plano." },
                                    { question: "Posso fazer terapia online?", answer: "Sim! Atendo presencialmente em Blumenau/SC e também online, com a mesma qualidade e sigilo profissional." }
                                ],
                                // Redes sociais
                                socialLinks: [
                                    { platform: 'instagram', url: 'https://instagram.com/psimarianacosta' },
                                    { platform: 'whatsapp', url: 'https://wa.me/5547991394589' }
                                ]
                            };
                            setCustomization(demoCustomization as any);
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

            {/* ChatWidget temporariamente desabilitado para redesign
            <ChatWidget
                mode="store"
                storeId={store.id}
                storeName={store.name}
                storePhone={store.phone}
            />
            */}
        </div>
    );
};

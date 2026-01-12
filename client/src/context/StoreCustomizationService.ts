// ========================================
// STORE CUSTOMIZATION SERVICE
// Gerencia as personalizações visuais da loja via API
// ========================================

import { storeApi } from '../services/storeApi';
import type { StoreCustomization } from '../types';

// Re-export for compatibility
export type { StoreCustomization };

// Cores predefinidas
export const PRESET_COLORS = [
    // Standard Colors
    { name: 'Roxo (Padrão)', primary: '#7c3aed', secondary: '#6366f1', accent: '#f97316' },
    { name: 'Azul Clássico', primary: '#2563eb', secondary: '#3b82f6', accent: '#f59e0b' },
    { name: 'Verde Esmeralda', primary: '#059669', secondary: '#10b981', accent: '#8b5cf6' },
    { name: 'Rosa Vibrante', primary: '#db2777', secondary: '#ec4899', accent: '#06b6d4' },
    { name: 'Vermelho Intenso', primary: '#dc2626', secondary: '#ef4444', accent: '#eab308' },
    { name: 'Laranja Solar', primary: '#ea580c', secondary: '#f97316', accent: '#7c3aed' },
    { name: 'Teal Moderno', primary: '#0d9488', secondary: '#14b8a6', accent: '#f43f5e' },
    { name: 'Índigo Profundo', primary: '#4f46e5', secondary: '#6366f1', accent: '#10b981' },

    // Thematic Collections
    // Earthy & Natural
    { name: 'Floresta Nórdica', primary: '#2D3436', secondary: '#636E72', accent: '#55EFC4' },
    { name: 'Terra Cotta', primary: '#A0522D', secondary: '#CD853F', accent: '#DEB887' },
    { name: 'Sálvia Calmante', primary: '#8FA382', secondary: '#B5C9A7', accent: '#F2D3BC' },
    { name: 'Areia do Deserto', primary: '#C2B280', secondary: '#E6D7B6', accent: '#8B4513' },
    { name: 'Café Expresso', primary: '#4B3621', secondary: '#6F4E37', accent: '#D2691E' },

    // Spa & Wellness
    { name: 'Lavanda Relax', primary: '#9F7AEA', secondary: '#B794F4', accent: '#F687B3' },
    { name: 'Água Marinha', primary: '#319795', secondary: '#81E6D9', accent: '#2B6CB0' },
    { name: 'Bambu Zen', primary: '#2F855A', secondary: '#68D391', accent: '#F6AD55' },
    { name: 'Lótus Rosa', primary: '#D53F8C', secondary: '#FBB6CE', accent: '#ED64A6' },

    // Luxury & High-End
    { name: 'Royal Gold', primary: '#1A202C', secondary: '#2D3748', accent: '#D69E2E' },
    { name: 'Midnight', primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8' },
    { name: 'Vinho Nobre', primary: '#702459', secondary: '#97266D', accent: '#E9D8FD' },
    { name: 'Champagne', primary: '#744210', secondary: '#B7791F', accent: '#F6E05E' },

    // Modern & Tech
    { name: 'Cyber Neon', primary: '#000000', secondary: '#1A1A1A', accent: '#00FF00' },
    { name: 'Clean Slate', primary: '#475569', secondary: '#94a3b8', accent: '#3b82f6' },
    { name: 'Dark Mode Blue', primary: '#1e3a8a', secondary: '#3b82f6', accent: '#60a5fa' },

    // Aesthetic Specifics
    { name: 'Clínica Lacaniana', primary: '#2D5A4A', secondary: '#F5E6D3', accent: '#C9A86C' },
    { name: 'Beauty Salon Pink', primary: '#be185d', secondary: '#db2777', accent: '#fbcfe8' },
    { name: 'Barber Classic', primary: '#1c1917', secondary: '#292524', accent: '#dc2626' },
    { name: 'Pediatria Fun', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#fbbf24' },
];

export const FONT_OPTIONS = [
    { id: 'inter', name: 'Inter', preview: 'font-family: Inter, sans-serif' },
    { id: 'poppins', name: 'Poppins', preview: 'font-family: Poppins, sans-serif' },
    { id: 'roboto', name: 'Roboto', preview: 'font-family: Roboto, sans-serif' },
    { id: 'outfit', name: 'Outfit', preview: 'font-family: Outfit, sans-serif' },
];

export const LAYOUT_OPTIONS = [
    { id: 'sophisticated-therapy', name: 'Sofisticado (Original)', description: 'Design premium com efeitos de vidro' },
    { id: 'modern-therapy', name: 'Moderno (Original)', description: 'Glassmorphism e Design Sofisticado' },
    { id: 'lacanian-clinic', name: 'Minimalista (Original)', description: 'Estilo clássico e misterioso com glassmorfismo' },
    { id: 'therapy-new', name: 'Terapia (Novo)', description: 'Azul e profissional (8 seções)' },
    { id: 'clinic-new', name: 'Clínica Acolhedora', description: 'Tons terrosos e institucional (9 seções)' },
    { id: 'harmony-new', name: 'Harmony Zen', description: 'Verde sálvia e mindfulness (9 seções)' },
    { id: 'vibrant-new', name: 'Vibrant Future', description: 'Cores neon e design 2026 (9 seções)' },
    { id: 'sunny-new', name: 'Sunny Day', description: 'Laranja e otimista (9 seções)' },
    { id: 'vitality-new', name: 'Vitality Performance', description: 'Verde esmeralda e alta performance (10 seções)' },
];

export const BUTTON_STYLES = [
    { id: 'rounded', name: 'Arredondado', borderRadius: '12px' },
    { id: 'square', name: 'Quadrado', borderRadius: '4px' },
    { id: 'pill', name: 'Pílula', borderRadius: '9999px' },
];

// Customização padrão
export const DEFAULT_CUSTOMIZATION: Omit<StoreCustomization, 'storeId'> = {
    primaryColor: '#7c3aed',
    secondaryColor: '#6366f1',
    accentColor: '#f97316',
    logo: null,
    coverImage: null,
    layout: 'therapy-new',
    daysLayout: 'grid',
    showRating: true,
    showAddress: true,
    showPhone: true,
    fontFamily: 'inter',
    buttonStyle: 'rounded',
    bannerText: '',
    bannerEnabled: false,
    instagram: '',
    whatsapp: '',
    facebook: '',
    updatedAt: new Date().toISOString(),
    welcomeTitle: '',
    welcomeMessage: '',
    galleryImages: [],
    specialties: [],
    textOverrides: {},
    teamImages: [],
    iconOverrides: {},
    buttonBgColor: '',
    buttonTextColor: '',
    footerBgColor: '',
    footerTextColor: '',
    iconColor: '',
    aboutImage: null,
    aboutTitle: '',
    aboutText: '',
    visibleSections: {},
    // Dynamic Defaults
    servicesList: [],
    team: [],
    testimonials: [],
    faq: []
};

// Buscar customização de uma loja específica (agora async e via API)
export const getStoreCustomization = async (storeId: string): Promise<StoreCustomization> => {
    try {
        const response = await storeApi.getById(storeId);
        if (response.success && response.store && response.store.customization && Object.keys(response.store.customization).length > 0) {
            const { storeId: _, ...rest } = response.store.customization;
            return {
                storeId,
                ...DEFAULT_CUSTOMIZATION,
                ...rest
            };
        }
    } catch (error) {
        console.error('Error fetching customization:', error);
    }

    // Retorna customização padrão se não existir ou falhar
    return {
        storeId,
        ...DEFAULT_CUSTOMIZATION,
    };
};

// Salvar customização de uma loja (async via API)
export const saveStoreCustomization = async (customization: StoreCustomization): Promise<boolean> => {
    try {
        await storeApi.updateCustomization(customization.storeId, customization);
        return true;
    } catch (error) {
        console.error('Error saving customization:', error);
        return false;
    }
};

// Buscar customização por slug da loja
export const getCustomizationBySlug = async (slug: string): Promise<StoreCustomization | null> => {
    try {
        const response = await storeApi.getBySlug(slug);

        if (response.success && response.store) {
            if (response.store.customization && Object.keys(response.store.customization).length > 0) {
                const { storeId: _, ...rest } = response.store.customization;
                return {
                    storeId: response.store.id,
                    ...DEFAULT_CUSTOMIZATION,
                    ...rest
                };
            }
            // Store exists but no custom data, return defaults
            return {
                storeId: response.store.id,
                ...DEFAULT_CUSTOMIZATION
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching customization by slug:', error);
        return null;
    }
};

// Resetar customização para o padrão
export const resetStoreCustomization = async (storeId: string): Promise<StoreCustomization> => {
    const defaultCustomization: StoreCustomization = {
        storeId,
        ...DEFAULT_CUSTOMIZATION,
    };

    await saveStoreCustomization(defaultCustomization);
    return defaultCustomization;
};

// Aplicar CSS customizado baseado na customização
export const generateCustomCSS = (customization: StoreCustomization): string => {
    return `
        :root {
            --store-primary: ${customization.primaryColor};
            --store-secondary: ${customization.secondaryColor};
            --store-accent: ${customization.accentColor};
        }
        
        .store-customized .btn-primary,
        .store-customized .booking-btn {
            background: linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.secondaryColor} 100%);
            border-radius: ${BUTTON_STYLES.find(b => b.id === customization.buttonStyle)?.borderRadius || '12px'};
        }
        
        .store-customized .store-hero {
            background-color: ${customization.primaryColor};
        }
        
        .store-customized .progress-step.active .step-number,
        .store-customized .progress-step.completed .step-number {
            background: ${customization.primaryColor};
            color: white;
        }
        
        .store-customized .service-option.selected {
            border-color: ${customization.primaryColor};
            box-shadow: 0 0 0 3px ${customization.primaryColor}20;
        }
        
        .store-customized .calendar-day.selected {
            background: ${customization.primaryColor};
            color: white;
        }
        
        .store-customized .time-slot.selected {
            background: ${customization.primaryColor};
            color: white;
        }
    `;
};

// Converter imagem para Base64 (para upload de logo/cover)
// Security: Validates file type and size before conversion
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5; // 5MB max
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            reject(new Error(`Tipo de arquivo não permitido. Use: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
            return;
        }

        // Validate file size
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            reject(new Error(`Arquivo muito grande. Tamanho máximo: ${MAX_IMAGE_SIZE_MB}MB`));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
    });
};

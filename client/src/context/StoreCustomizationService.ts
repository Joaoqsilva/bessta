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
    { name: 'Roxo', primary: '#7c3aed', secondary: '#6366f1', accent: '#f97316' },
    { name: 'Azul', primary: '#2563eb', secondary: '#3b82f6', accent: '#f59e0b' },
    { name: 'Verde', primary: '#059669', secondary: '#10b981', accent: '#8b5cf6' },
    { name: 'Rosa', primary: '#db2777', secondary: '#ec4899', accent: '#06b6d4' },
    { name: 'Vermelho', primary: '#dc2626', secondary: '#ef4444', accent: '#eab308' },
    { name: 'Laranja', primary: '#ea580c', secondary: '#f97316', accent: '#7c3aed' },
    { name: 'Clínica Lacaniana', primary: '#2D5A4A', secondary: '#F5E6D3', accent: '#C9A86C' },
    { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6', accent: '#f43f5e' },
    { name: 'Índigo', primary: '#4f46e5', secondary: '#6366f1', accent: '#10b981' },
];

export const FONT_OPTIONS = [
    { id: 'inter', name: 'Inter', preview: 'font-family: Inter, sans-serif' },
    { id: 'poppins', name: 'Poppins', preview: 'font-family: Poppins, sans-serif' },
    { id: 'roboto', name: 'Roboto', preview: 'font-family: Roboto, sans-serif' },
    { id: 'outfit', name: 'Outfit', preview: 'font-family: Outfit, sans-serif' },
];

export const LAYOUT_OPTIONS = [
    { id: 'beauty-salon', name: 'Salão de Beleza', description: 'Elegante e vibrante' },
    { id: 'psychology-office', name: 'Psicologia Clássico', description: 'Cores pastéis e acolhedor' },
    { id: 'modern-therapy', name: 'Terapia Moderna (TCC)', description: 'Glassmorphism e Design Sofisticado' },
    { id: 'sophisticated-therapy', name: 'Terapia Sofisticada', description: 'Design premium com efeitos de vidro' },
    { id: 'lacanian-clinic', name: 'Clínica Lacaniana', description: 'Estilo clássico e misterioso com glassmorfismo' },
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
    layout: 'psychology-office',
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
    aboutText: ''
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
export const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

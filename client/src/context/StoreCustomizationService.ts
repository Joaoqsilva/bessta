// ========================================
// STORE CUSTOMIZATION SERVICE
// Gerencia as personalizações visuais da loja
// ========================================

export interface StoreCustomization {
    storeId: string;

    // Cores
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;

    // Imagens
    logo: string | null;
    coverImage: string | null;

    // Layout
    layout: 'beauty-salon' | 'psychology-office' | 'modern-therapy' | 'sophisticated-therapy' | 'lacanian-clinic';
    daysLayout?: 'grid' | 'list'; // Adicionado
    showRating: boolean;
    showAddress: boolean;
    showPhone: boolean;
    // Novos campos para layouts profissionais (ex: Landing Page)
    welcomeTitle?: string;
    welcomeMessage?: string;
    galleryImages?: string[];
    aboutImage?: string | null;
    aboutTitle?: string;
    aboutText?: string;
    textOverrides?: Record<string, { content?: string; color?: string }>;
    specialties?: string[];
    teamImages?: string[];  // Fotos dos membros da equipe
    iconOverrides?: Record<string, string>;  // Mapeamento de ID para nome do ícone

    // Fontes
    fontFamily: 'inter' | 'poppins' | 'roboto' | 'outfit';

    // Cores de Elementos
    buttonBgColor?: string;      // Cor de fundo dos botões
    buttonTextColor?: string;    // Cor do texto dos botões
    footerBgColor?: string;      // Cor de fundo do rodapé
    footerTextColor?: string;    // Cor do texto do rodapé
    iconColor?: string;          // Cor dos ícones

    // Estilo dos botões
    buttonStyle: 'rounded' | 'square' | 'pill';

    // Banner promocional
    bannerText: string;
    bannerEnabled: boolean;

    // Redes sociais
    instagram: string;
    whatsapp: string;
    facebook: string;

    updatedAt: string;
}

// Cores predefinidas para escolha rápida
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

const STORAGE_KEY = 'bessta_store_customizations';

// Customização padrão
const DEFAULT_CUSTOMIZATION: Omit<StoreCustomization, 'storeId'> = {
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
};

// Buscar todas as customizações
const getAllCustomizations = (): StoreCustomization[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Salvar todas as customizações
const saveAllCustomizations = (customizations: StoreCustomization[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customizations));
};

// Buscar customização de uma loja específica
export const getStoreCustomization = (storeId: string): StoreCustomization => {
    const customizations = getAllCustomizations();
    const existing = customizations.find(c => c.storeId === storeId);

    if (existing) {
        return existing;
    }

    // Retorna customização padrão se não existir
    return {
        storeId,
        ...DEFAULT_CUSTOMIZATION,
    };
};

// Salvar customização de uma loja
export const saveStoreCustomization = (customization: StoreCustomization): void => {
    const customizations = getAllCustomizations();
    const index = customizations.findIndex(c => c.storeId === customization.storeId);

    const updatedCustomization = {
        ...customization,
        updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
        customizations[index] = updatedCustomization;
    } else {
        customizations.push(updatedCustomization);
    }

    saveAllCustomizations(customizations);
};

// Buscar customização por slug da loja
export const getCustomizationBySlug = (slug: string): StoreCustomization | null => {
    try {
        // Buscar o storeId pelo slug
        const stores = JSON.parse(localStorage.getItem('bessta_stores') || '[]');
        const store = stores.find((s: { slug: string }) => s.slug === slug);

        if (!store) {
            return null;
        }

        return getStoreCustomization(store.id);
    } catch {
        return null;
    }
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

// Resetar customização para o padrão
export const resetStoreCustomization = (storeId: string): StoreCustomization => {
    const defaultCustomization: StoreCustomization = {
        storeId,
        ...DEFAULT_CUSTOMIZATION,
    };

    saveStoreCustomization(defaultCustomization);
    return defaultCustomization;
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

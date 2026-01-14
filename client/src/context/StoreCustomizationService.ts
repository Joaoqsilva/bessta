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
    // ===== PALETAS PRINCIPAIS (MANTER) =====
    // Paleta 1 - Clínica Lacaniana (Verde/Bege/Dourado)
    { name: 'Clínica Lacaniana', primary: '#2D5A4A', secondary: '#F5E6D3', accent: '#C9A86C' },
    // Paleta 2 - Harmony Zen (Verde claro/Bege/Cinza)
    { name: 'Harmony Zen', primary: '#A7C4A0', secondary: '#E8D4C8', accent: '#6B7280' },

    // ===== PALETAS PARA TERAPIA =====
    { name: 'Terapia Clássica', primary: '#4A6FA5', secondary: '#E8EEF5', accent: '#9BB5D9' },
    { name: 'Psicologia Moderna', primary: '#5B7B8C', secondary: '#F0F4F8', accent: '#A8C5D8' },
    { name: 'Bem-Estar Suave', primary: '#7CA7A0', secondary: '#FDF8F3', accent: '#D4A574' },
    { name: 'Calma Profunda', primary: '#5D6B7A', secondary: '#F5F5F5', accent: '#8AA4BD' },

    // ===== PALETAS PARA CLÍNICA INSTITUCIONAL =====
    { name: 'Clínica Profissional', primary: '#3D5A6C', secondary: '#E8E4DF', accent: '#8BA9A5' },
    { name: 'Médico Confiável', primary: '#2C5F7C', secondary: '#F8F6F4', accent: '#6BA3C7' },
    { name: 'Saúde & Cuidado', primary: '#4E8975', secondary: '#FBF9F7', accent: '#A5C4AD' },
    { name: 'Acolhimento', primary: '#6B8E7C', secondary: '#F5EDE6', accent: '#C4A67E' },

    // ===== PALETAS SOFISTICADAS =====
    { name: 'Elegância Sóbria', primary: '#3C3C3C', secondary: '#F2EDE8', accent: '#A08060' },
    { name: 'Luxo Discreto', primary: '#2F3640', secondary: '#EDE7E1', accent: '#B8A07A' },
    { name: 'Premium Minimalista', primary: '#1F2937', secondary: '#F9FAFB', accent: '#6366F1' },
    { name: 'Sofisticado', primary: '#374151', secondary: '#F3F4F6', accent: '#8B5CF6' },

    // ===== PALETAS CORES SUAVES =====
    { name: 'Rosa Suave', primary: '#A67E88', secondary: '#FBF5F3', accent: '#D4A5AB' },
    { name: 'Lavanda Serena', primary: '#7C6D8A', secondary: '#F6F4F8', accent: '#B8A9C9' },
    { name: 'Verde Sálvia', primary: '#7A8E7A', secondary: '#F8FAF5', accent: '#A5B8A0' },
    { name: 'Azul Serenidade', primary: '#6C8BA3', secondary: '#F5F8FA', accent: '#A3C4D9' },

    // ===== PALETAS VIBRANTES =====
    { name: 'Energia Positiva', primary: '#E07C4F', secondary: '#FEF7F0', accent: '#F5A574' },
    { name: 'Verde Vitalidade', primary: '#2D9C6C', secondary: '#F0FDF4', accent: '#6FD39F' },
    { name: 'Azul Dinâmico', primary: '#3B82F6', secondary: '#EFF6FF', accent: '#60A5FA' },
    { name: 'Roxo Criativo', primary: '#7C3AED', secondary: '#F5F3FF', accent: '#A78BFA' },

    // ===== PALETAS TEMA ESPECÍFICO =====
    { name: 'Estética & Beleza', primary: '#C47B8C', secondary: '#FDF2F5', accent: '#E5A4B4' },
    { name: 'Barbearia Clássica', primary: '#2C2C2C', secondary: '#F5F5F5', accent: '#B45F4D' },
    { name: 'Pediatria Alegre', primary: '#4BB4DE', secondary: '#F0F9FF', accent: '#FBB040' },
    { name: 'Nutrição Natural', primary: '#5D8C4B', secondary: '#F5F9EF', accent: '#A5C882' },
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

// Mapa de seções disponíveis por layout
export const LAYOUT_SECTIONS: Record<string, { id: string; name: string }[]> = {
    'sophisticated-therapy': [
        { id: 'hero', name: 'Hero' },
        { id: 'about', name: 'Sobre' },
        { id: 'services', name: 'Serviços' },
        { id: 'team', name: 'Equipe' },
        { id: 'testimonials', name: 'Depoimentos' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contato' },
    ],
    'modern-therapy': [
        { id: 'hero', name: 'Hero' },
        { id: 'about', name: 'Sobre' },
        { id: 'services', name: 'Serviços' },
        { id: 'team', name: 'Equipe' },
        { id: 'gallery', name: 'Galeria' },
        { id: 'testimonials', name: 'Depoimentos' },
        { id: 'faq', name: 'FAQ' },
    ],
    'lacanian-clinic': [
        { id: 'hero', name: 'Hero' },
        { id: 'about', name: 'Sobre' },
        { id: 'services', name: 'Serviços' },
        { id: 'gallery', name: 'Galeria' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contato' },
    ],
    'therapy-new': [
        { id: 'hero', name: 'Hero' },
        { id: 'highlights', name: 'Destaques' },
        { id: 'about', name: 'Sobre' },
        { id: 'services', name: 'Serviços' },
        { id: 'team', name: 'Equipe' },
        { id: 'testimonials', name: 'Depoimentos' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contato' },
    ],
    'clinic-new': [
        { id: 'hero', name: 'Hero' },
        { id: 'problem', name: 'Problema' },
        { id: 'about', name: 'Sobre' },
        { id: 'services', name: 'Especialidades' },
        { id: 'team', name: 'Equipe' },
        { id: 'gallery', name: 'Galeria' },
        { id: 'testimonials', name: 'Depoimentos' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contato' },
    ],
    'harmony-new': [
        { id: 'hero', name: 'Hero' },
        { id: 'highlights', name: 'Empathy' },
        { id: 'about', name: 'Sobre' },
        { id: 'services', name: 'Serviços' },
        { id: 'steps', name: 'Jornada' },
        { id: 'testimonials', name: 'Depoimentos' },
        { id: 'faq', name: 'FAQ' },
        { id: 'video', name: 'Vídeo' },
        { id: 'contact', name: 'Contato' },
    ],
    'vibrant-new': [
        { id: 'hero', name: 'Hero' },
        { id: 'highlights', name: 'Impacto' },
        { id: 'method', name: 'Metodologia' },
        { id: 'services', name: 'Protocolos' },
        { id: 'stats', name: 'Estatísticas' },
        { id: 'team', name: 'Equipe' },
        { id: 'gallery', name: 'Experiência' },
        { id: 'testimonials', name: 'Comunidade' },
        { id: 'contact', name: 'Contato' },
    ],
    'sunny-new': [
        { id: 'hero', name: 'Hero' },
        { id: 'highlights', name: 'Destaques' },
        { id: 'about', name: 'Sobre' },
        { id: 'services', name: 'Serviços' },
        { id: 'steps', name: 'Jornada' },
        { id: 'testimonials', name: 'Depoimentos' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contato' },
    ],
    'vitality-new': [
        { id: 'hero', name: 'Hero' },
        { id: 'highlights', name: 'Destaques' },
        { id: 'about', name: 'Sobre' },
        { id: 'stats', name: 'Estatísticas' },
        { id: 'services', name: 'Especialidades' },
        { id: 'journey', name: 'Jornada' },
        { id: 'expertise', name: 'Destaque' },
        { id: 'testimonials', name: 'Depoimentos' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contato' },
    ],
};

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
    faq: [],
    socialLinks: []
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

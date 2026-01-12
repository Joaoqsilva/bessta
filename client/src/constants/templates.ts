
import type { StoreCustomization } from '../context/StoreCustomizationService';

export type StoreCategory = 'beauty' | 'health' | 'fitness' | 'other';

interface StoreTemplate {
    id: string;
    name: string;
    category: StoreCategory;
    defaultCustomization: Partial<StoreCustomization>;
}

export const STORE_TEMPLATES: Record<StoreCategory, StoreTemplate> = {
    beauty: {
        id: 'modern_barber',
        name: 'Barbearia Moderna',
        category: 'beauty',
        defaultCustomization: {
            primaryColor: '#0f172a', // Slate 900
            secondaryColor: '#ea580c', // Orange 600
            daysLayout: 'grid',
            buttonStyle: 'rounded',
            bannerEnabled: true,
            bannerText: '✂️ Agende seu corte e ganhe pontos fidelidade!',
            layout: 'vibrant-new'
        }
    },
    health: {
        id: 'calm_health',
        name: 'Clínica & Terapia',
        category: 'health',
        defaultCustomization: {
            primaryColor: '#0d9488', // Teal 600
            secondaryColor: '#ccfbf1', // Teal 100
            daysLayout: 'list',
            buttonStyle: 'pill',
            bannerEnabled: false,
            layout: 'lacanian-clinic',
            welcomeTitle: 'Cuidando do seu bem-estar',
            welcomeMessage: 'Agende sua consulta online.',
        }
    },
    fitness: {
        id: 'fitness_power',
        name: 'Personal & Academia',
        category: 'fitness',
        defaultCustomization: {
            primaryColor: '#dc2626',
            secondaryColor: '#171717',
            daysLayout: 'grid',
            buttonStyle: 'square',
            bannerEnabled: true,
            bannerText: '💪 Comece agora!',
            layout: 'modern-therapy'
        }
    },
    other: {
        id: 'simple_service',
        name: 'Padrão',
        category: 'other',
        defaultCustomization: {
            primaryColor: '#2563eb',
            secondaryColor: '#eff6ff',
            daysLayout: 'list',
            buttonStyle: 'rounded',
            bannerEnabled: false,
            layout: 'therapy-new'
        }
    }
};

export const getTemplateByCategory = (category: string): StoreTemplate => {
    return STORE_TEMPLATES[category as StoreCategory] || STORE_TEMPLATES.other;
};

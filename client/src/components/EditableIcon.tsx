import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import type { StoreCustomization } from '../context/StoreCustomizationService';

// Lista de ícones populares para seleção rápida
export const POPULAR_ICONS = [
    // Pessoas e Saúde
    'User', 'Users', 'UserCheck', 'UserPlus', 'Heart', 'HeartPulse', 'Activity', 'Brain', 'Smile', 'SmilePlus',
    // Comunicação
    'Phone', 'Mail', 'MessageCircle', 'MessageSquare', 'Send', 'Bell', 'AtSign',
    // Localização e Tempo
    'MapPin', 'Map', 'Navigation', 'Clock', 'Calendar', 'CalendarCheck', 'CalendarDays', 'Timer',
    // Beleza e Estilo
    'Scissors', 'Sparkles', 'Star', 'Gem', 'Crown', 'Flower', 'Flower2', 'Palette',
    // Médico/Saúde
    'Stethoscope', 'Pill', 'Syringe', 'Thermometer', 'Shield', 'ShieldCheck', 'ShieldPlus',
    // Negócios
    'Briefcase', 'Building', 'Building2', 'Store', 'CreditCard', 'DollarSign', 'Receipt', 'Wallet',
    // Tecnologia
    'Laptop', 'Smartphone', 'Wifi', 'Camera', 'Video', 'Mic', 'Headphones', 'Monitor',
    // Natureza
    'Sun', 'Moon', 'Cloud', 'Leaf', 'TreeDeciduous', 'Mountain', 'Waves', 'Droplet',
    // Ações
    'Check', 'CheckCircle', 'Plus', 'PlusCircle', 'ArrowRight', 'ArrowUp', 'RefreshCw', 'Zap',
    // Social
    'Instagram', 'Facebook', 'Twitter', 'Linkedin', 'Youtube', 'Globe', 'Link', 'Share2',
    // Outros
    'Home', 'Settings', 'Search', 'Eye', 'Lock', 'Key', 'Award', 'Trophy', 'Target', 'Lightbulb',
    'Coffee', 'UtensilsCrossed', 'Wine', 'Music', 'Book', 'BookOpen', 'GraduationCap', 'Rocket'
];

interface EditableIconProps {
    id: string;
    defaultIcon: string;  // Nome do ícone Lucide
    customization?: StoreCustomization;
    isEditorMode?: boolean;
    onEditAction?: (action: string, defaultValue?: string) => void;
    size?: number;
    className?: string;
    strokeWidth?: number;
}

// Componente para renderizar um ícone pelo nome
export const DynamicIcon = ({
    name,
    size = 24,
    className = '',
    strokeWidth = 2
}: {
    name: string;
    size?: number;
    className?: string;
    strokeWidth?: number;
}) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) {
        // Fallback para ícone de interrogação se não encontrar
        const FallbackIcon = LucideIcons.HelpCircle;
        return <FallbackIcon size={size} className={className} strokeWidth={strokeWidth} />;
    }
    return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
};

export const EditableIcon = ({
    id,
    defaultIcon,
    customization,
    isEditorMode,
    onEditAction,
    size = 24,
    className = '',
    strokeWidth = 2
}: EditableIconProps) => {

    // Busca override do ícone
    const iconName = customization?.iconOverrides?.[id] || defaultIcon;
    const actionId = `icon-edit__${id}`;

    if (!isEditorMode) {
        return <DynamicIcon name={iconName} size={size} className={className} strokeWidth={strokeWidth} />;
    }

    return (
        <span
            className={`relative group cursor-pointer inline-flex items-center justify-center p-1 rounded hover:bg-blue-50 hover:ring-2 hover:ring-blue-200 transition-all ${className}`}
            onClick={(e) => {
                e.stopPropagation();
                onEditAction?.(actionId, defaultIcon);
            }}
        >
            <DynamicIcon name={iconName} size={size} strokeWidth={strokeWidth} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <LucideIcons.Pencil size={10} className="text-white" />
            </span>
        </span>
    );
};

// Componente de Seletor de Ícones (para uso no editor)
interface IconPickerProps {
    selectedIcon: string;
    onSelect: (iconName: string) => void;
    onClose: () => void;
}

export const IconPicker = ({ selectedIcon, onSelect, onClose }: IconPickerProps) => {
    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(false);

    // Filtrar ícones
    const allIconNames = Object.keys(LucideIcons).filter(
        name => typeof (LucideIcons as any)[name] === 'function' && name !== 'createLucideIcon'
    );

    const displayIcons = showAll
        ? allIconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()))
        : POPULAR_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Selecionar Ícone</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <LucideIcons.X size={20} />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar ícone..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            className={`text-xs px-3 py-1 rounded-full ${!showAll ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                            onClick={() => setShowAll(false)}
                        >
                            Populares ({POPULAR_ICONS.length})
                        </button>
                        <button
                            className={`text-xs px-3 py-1 rounded-full ${showAll ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                            onClick={() => setShowAll(true)}
                        >
                            Todos ({allIconNames.length})
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-8 gap-2">
                        {displayIcons.slice(0, 200).map((iconName) => (
                            <button
                                key={iconName}
                                className={`p-3 rounded-lg border transition-all hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-1 ${selectedIcon === iconName ? 'bg-blue-100 border-blue-500' : 'border-gray-100'
                                    }`}
                                onClick={() => onSelect(iconName)}
                                title={iconName}
                            >
                                <DynamicIcon name={iconName} size={24} />
                            </button>
                        ))}
                    </div>
                    {displayIcons.length > 200 && (
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Mostrando 200 de {displayIcons.length} ícones. Use a busca para encontrar mais.
                        </p>
                    )}
                    {displayIcons.length === 0 && (
                        <p className="text-center text-gray-400 py-8">Nenhum ícone encontrado</p>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <p className="text-xs text-gray-500 text-center">
                        Selecionado: <strong>{selectedIcon}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { EditOverlay } from './EditOverlay';
import type { StoreCustomization } from '../context/StoreCustomizationService';

interface EditableTextProps {
    id: string;
    defaultText: string;
    defaultColor?: string; // Cor padrão do texto (do CSS/tema)
    customization?: StoreCustomization;
    isEditorMode?: boolean;
    onEditAction?: (action: string, defaultValue?: string, defaultColor?: string) => void;
    className?: string;
    tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'li';
    style?: React.CSSProperties;
    label?: string;
}

export const EditableText = ({
    id,
    defaultText,
    defaultColor,
    customization,
    isEditorMode,
    onEditAction,
    className = "",
    tagName: Tag = 'p',
    style,
    label = "Editar"
}: EditableTextProps) => {

    // Busca o override (objeto com content e color)
    const textOverride = customization?.textOverrides?.[id];
    const displayText = textOverride?.content !== undefined ? textOverride.content : defaultText;

    // Cor: prioridade é override > defaultColor prop > style.color > undefined
    const textColor = textOverride?.color || defaultColor || (style?.color as string);

    // Ação formatada
    const actionId = `text-edit__${id}`;

    // Estilo combinado com cor customizada
    const combinedStyle: React.CSSProperties = {
        whiteSpace: 'pre-line',
        ...style,
        ...(textOverride?.color ? { color: textOverride.color } : {})
    };

    if (!isEditorMode) {
        return <Tag className={className} style={combinedStyle}>{displayText}</Tag>;
    }

    return (
        <Tag
            className={`relative group border border-transparent hover:bg-blue-50/50 hover:border-blue-200 rounded px-1 -mx-1 transition-all ${className}`}
            style={{ ...combinedStyle, cursor: 'pointer' }}
            onClick={(e: React.MouseEvent) => {
                if (isEditorMode && onEditAction) {
                    e.stopPropagation();
                    // Passa texto padrão E cor atual/padrão para o editor
                    onEditAction(actionId, defaultText, textColor);
                }
            }}
        >
            {displayText}
            <EditOverlay
                label={label}
                action={actionId}
                isEditorMode={true}
                onEditAction={() => onEditAction?.(actionId, defaultText, textColor)}
            />
        </Tag>
    );
};

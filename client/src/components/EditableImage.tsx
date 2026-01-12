import React from 'react';
import { EditOverlay } from './EditOverlay';
import { Image as ImageIcon } from 'lucide-react';
import { Lightbox } from './Lightbox';

interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    editKey: string; // The key used in StoreCustomization (e.g., 'logo', 'coverImage') or a specific ID
    currentSrc?: string | null;
    isEditorMode?: boolean;
    onEditAction?: (action: string) => void;
    label?: string;
    // For background images
    asBackground?: boolean;
    renderPlaceholder?: () => React.ReactNode;
    children?: React.ReactNode;
}

export const EditableImage = ({
    editKey,
    currentSrc,
    isEditorMode,
    onEditAction,
    label = "Alterar Imagem",
    asBackground = false,
    className = "",
    renderPlaceholder,
    children,
    ...imgProps
}: EditableImageProps) => {

    const actionId = `image-edit__${editKey}`;
    const src = currentSrc || imgProps.src;
    const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

    // Handler for click
    const handleClick = (e: React.MouseEvent) => {
        // If in editor mode, trigger edit action
        if (isEditorMode) {
            if (onEditAction) {
                e.preventDefault();
                e.stopPropagation();
                onEditAction(actionId);
            }
            return;
        }

        // If in public mode and has image, open lightbox
        if (src && !asBackground) {
            e.preventDefault();
            e.stopPropagation();
            setIsLightboxOpen(true);
        }
    };

    if (asBackground) {
        return (
            <div
                className={`relative group ${className} ${isEditorMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''}`}
                onClick={handleClick}
                style={{
                    backgroundImage: src ? `url(${src})` : undefined,
                    ...imgProps.style
                }}
            >
                {children}
                {isEditorMode && (
                    <EditOverlay
                        label={label}
                        action={actionId}
                        isEditorMode={true}
                        onEditAction={(a) => onEditAction?.(a)}
                    />
                )}
            </div>
        );
    }

    if (!src && !isEditorMode) {
        return null;
    }

    if (!src && isEditorMode) {
        if (renderPlaceholder) {
            return (
                <div onClick={handleClick} className={`cursor-pointer group relative ${className}`}>
                    {renderPlaceholder()}
                    <EditOverlay label={label} action={actionId} isEditorMode={true} onEditAction={(a) => onEditAction?.(a)} />
                </div>
            );
        }
        // Placeholder for missing image in editor mode
        return (
            <div
                className={`relative group cursor-pointer bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all ${className}`}
                onClick={handleClick}
                style={imgProps.style}
            >
                <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon size={24} />
                    <span className="text-xs mt-1">{label}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`relative group inline-block ${isEditorMode ? 'cursor-pointer' : 'cursor-zoom-in'} ${className}`} style={{ width: imgProps.width, height: imgProps.height }}>
                <img
                    {...imgProps}
                    src={src || undefined} // If null/empty string, standard img might show border, handle below
                    className={`block w-full h-full object-cover transition-all ${isEditorMode ? 'group-hover:opacity-90 group-hover:ring-2 group-hover:ring-blue-400' : ''}`}
                    onClick={handleClick}
                />
                {isEditorMode && (
                    <EditOverlay
                        label={label}
                        action={actionId}
                        isEditorMode={true}
                        onEditAction={(a) => onEditAction?.(a)}
                    />
                )}
            </div>
            {src && (
                <Lightbox
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                    src={src}
                    alt={imgProps.alt || label}
                />
            )}
        </>
    );
};

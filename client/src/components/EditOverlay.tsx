import React from 'react';
import { Edit2 } from 'lucide-react';

interface EditOverlayProps {
    label: string;
    action: string;
    isEditorMode?: boolean;
    onEditAction?: (section: string) => void;
    className?: string;
    position?: 'absolute' | 'relative';
}

export const EditOverlay: React.FC<EditOverlayProps> = ({
    label,
    action,
    isEditorMode,
    onEditAction,
    className = '',
    position = 'absolute'
}) => {
    if (!isEditorMode || !onEditAction) return null;

    return (
        <div
            className={`edit-overlay ${className}`}
            style={{ position }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditAction(action);
            }}
        >
            <div className="edit-btn">
                <Edit2 size={14} />
                <span>{label}</span>
            </div>
        </div>
    );
};

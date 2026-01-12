import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    alt?: string;
}

export const Lightbox = ({ isOpen, onClose, src, alt }: LightboxProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
                <X size={32} />
            </button>

            <div
                className="relative max-w-full max-h-full flex items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt={alt || "Lightbox View"}
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                />
            </div>
        </div>,
        document.body
    );
};

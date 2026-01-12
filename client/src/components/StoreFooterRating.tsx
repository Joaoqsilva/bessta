import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { StarRating } from './StarRating';

interface StoreFooterRatingProps {
    storeId: string;
    rating?: number;
    totalReviews?: number;
    color?: string; // hex
    isEditorMode?: boolean;
    textColor?: string;
}

export const StoreFooterRating = ({
    storeId,
    rating = 0,
    totalReviews = 0,
    color = "#fbbf24",
    isEditorMode,
    textColor = "currentColor"
}: StoreFooterRatingProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpen = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // In editor mode, maybe don't open? Or allow it to test?
        // Let's allow it.
        setIsModalOpen(true);
    };

    return (
        <>
            <div
                className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleOpen}
                title="Deixe sua avaliação"
            >
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold mr-1" style={{ color: textColor }}>{(rating || 5.0).toFixed(1)}</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={16}
                            fill={star <= Math.round(rating || 5) ? color : "none"}
                            color={color}
                            className="shrink-0"
                        />
                    ))}
                </div>
                <p className="text-xs opacity-70 underline hover:no-underline" style={{ color: textColor }}>
                    {totalReviews > 0 ? `${totalReviews} avaliações` : 'Avalie-nos'}
                </p>
            </div>

            {isModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-200 p-2"
                        >
                            <X size={24} />
                        </button>
                        <StarRating
                            storeId={storeId}
                            primaryColor={color}
                            onRatingSubmit={() => {
                                setTimeout(() => setIsModalOpen(false), 3500);
                            }}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

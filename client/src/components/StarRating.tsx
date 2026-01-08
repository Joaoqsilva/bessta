import { useState } from 'react';
import { Star } from 'lucide-react';
import { addStoreReview, getStoreAverageRating } from '../context/StoreReviewService';

interface StarRatingProps {
    storeId: string;
    primaryColor?: string;
    onRatingSubmit?: (rating: number) => void;
}

export const StarRating = ({ storeId, primaryColor = '#fbbf24', onRatingSubmit }: StarRatingProps) => {
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [showThankYou, setShowThankYou] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');

    const { average, total } = getStoreAverageRating(storeId);

    const handleStarClick = (rating: number) => {
        setSelectedRating(rating);
        setShowCommentForm(true);
    };

    const handleSubmit = () => {
        if (selectedRating) {
            addStoreReview(storeId, selectedRating, comment || undefined, name || 'Cliente');
            setShowThankYou(true);
            setShowCommentForm(false);
            onRatingSubmit?.(selectedRating);

            // Reset after 3 seconds
            setTimeout(() => {
                setShowThankYou(false);
                setSelectedRating(null);
                setComment('');
                setName('');
            }, 3000);
        }
    };

    if (showThankYou) {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '24px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                animation: 'fadeIn 0.5s ease',
                border: '1px solid rgba(255,255,255,0.5)'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'bounce 1s infinite' }}>🎉</div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#1f2937', fontWeight: 700 }}>
                    Obrigado!
                </h4>
                <p style={{ fontSize: '1rem', color: '#4b5563' }}>
                    Sua avaliação ajuda a melhorar nossos serviços.
                </p>
            </div>
        );
    }

    if (showCommentForm) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                animation: 'slideUp 0.4s ease',
                color: '#374151'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={24}
                                fill={star <= (selectedRating || 0) ? primaryColor : "none"}
                                color={star <= (selectedRating || 0) ? primaryColor : "#d1d5db"}
                            />
                        ))}
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
                        Conte-nos mais
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>O que você achou da experiência?</p>
                </div>

                <input
                    type="text"
                    placeholder="Seu nome (opcional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        color: '#111827',
                        marginBottom: '12px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = primaryColor}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />

                <textarea
                    placeholder="Escreva seu comentário aqui..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        color: '#111827',
                        marginBottom: '20px',
                        fontSize: '0.95rem',
                        resize: 'none',
                        outline: 'none',
                        transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = primaryColor}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={() => { setShowCommentForm(false); setSelectedRating(null); }}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                        Voltar
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '12px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            background: primaryColor,
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            transform: 'translateZ(0)',
            transition: 'transform 0.3s ease'
        }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#111827', fontWeight: 700 }}>
                    Avalie nossa Loja
                </h4>
                {total > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>{average}</span>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={14} fill={s <= Math.round(average) ? primaryColor : "#e5e7eb"} color="none" />
                            ))}
                        </div>
                        <span>({total} opiniões)</span>
                    </div>
                ) : (
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Seja o primeiro a avaliar!</p>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            transform: (hoveredStar && star <= hoveredStar) ? 'scale(1.3)' : 'scale(1)'
                        }}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        onClick={() => handleStarClick(star)}
                    >
                        <Star
                            size={36}
                            fill={(hoveredStar && star <= hoveredStar) ? primaryColor : "none"}
                            color={(hoveredStar && star <= hoveredStar) ? primaryColor : "#d1d5db"}
                            strokeWidth={1.5}
                        />
                    </button>
                ))}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>
                Toque nas estrelas para classificar
            </p>
        </div>
    );
};

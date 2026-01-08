// Store Rating/Review Service
// Handles saving and retrieving store ratings from landing pages

export interface StoreReview {
    id: string;
    storeId: string;
    rating: number;
    comment?: string;
    customerName?: string;
    customerEmail?: string;
    createdAt: string;
}

const STORAGE_KEY = 'bessta_store_reviews';

// Get all reviews for a specific store
export const getStoreReviews = (storeId: string): StoreReview[] => {
    try {
        const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return allReviews[storeId] || [];
    } catch {
        return [];
    }
};

// Add a new review for a store
export const addStoreReview = (storeId: string, rating: number, comment?: string, customerName?: string): StoreReview => {
    const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (!allReviews[storeId]) {
        allReviews[storeId] = [];
    }

    const newReview: StoreReview = {
        id: `review-${Date.now()}`,
        storeId,
        rating,
        comment,
        customerName,
        createdAt: new Date().toISOString(),
    };

    allReviews[storeId].push(newReview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));

    return newReview;
};

// Calculate average rating for a store
export const getStoreAverageRating = (storeId: string): { average: number; total: number } => {
    const reviews = getStoreReviews(storeId);
    if (reviews.length === 0) {
        return { average: 0, total: 0 };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
        average: Math.round((sum / reviews.length) * 10) / 10,
        total: reviews.length,
    };
};

// Get rating distribution (how many 1-star, 2-star, etc.)
export const getRatingDistribution = (storeId: string): Record<number, number> => {
    const reviews = getStoreReviews(storeId);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach(review => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });

    return distribution;
};

// Get recent reviews (last N reviews)
export const getRecentReviews = (storeId: string, limit: number = 5): StoreReview[] => {
    const reviews = getStoreReviews(storeId);
    return reviews
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
};

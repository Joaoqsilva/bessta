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

// Store Rating/Review Service
// Handles saving and retrieving store ratings via API

import { reviewsApi } from '../services/platformApi';

// Re-export type if needed, or import from platformApi
// But consumers use StoreReview type locally defined here, so let's map it or keep it compatible?
// platformApi defines Review. StoreReview has similar structure.
export interface StoreReview {
    id: string;
    storeId: string;
    rating: number;
    comment?: string;
    customerName?: string;
    customerEmail?: string;
    createdAt: string;
}

// Get all reviews for a specific store
export const getStoreReviews = async (storeId: string): Promise<StoreReview[]> => {
    try {
        const result = await reviewsApi.getByStore(storeId, { limit: 100 });
        return result.reviews.map(r => ({
            id: r._id || '',
            storeId: r.storeId,
            rating: r.rating,
            comment: r.comment,
            customerName: r.customerName,
            customerEmail: r.customerEmail,
            createdAt: r.createdAt || new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
};

// Add a new review for a store
export const addStoreReview = async (storeId: string, rating: number, comment?: string, customerName?: string): Promise<StoreReview | null> => {
    try {
        const result = await reviewsApi.create(storeId, {
            customerName: customerName || 'Anônimo',
            rating,
            comment: comment || ''
        });
        return {
            id: result._id || '',
            storeId: result.storeId,
            rating: result.rating,
            comment: result.comment,
            customerName: result.customerName,
            customerEmail: result.customerEmail,
            createdAt: result.createdAt || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error adding review:', error);
        return null;
    }
};

// Calculate average rating for a store (using API stats)
export const getStoreAverageRating = async (storeId: string): Promise<{ average: number; total: number }> => {
    try {
        const result = await reviewsApi.getByStore(storeId, { limit: 1 });
        return {
            average: result.stats.averageRating,
            total: result.stats.totalReviews
        };
    } catch (error) {
        console.error('Error getting rating stats:', error);
        return { average: 5, total: 0 };
    }
};

// Get rating distribution (how many 1-star, 2-star, etc.)
// Not supported by current API endpoint efficiently without aggregation endpoint.
// For now we can fetch all (limited) or just return empty/mock if not essential.
// Or we can add an endpoint. Let's return mock or simple count if we fetch all.
export const getRatingDistribution = async (storeId: string): Promise<Record<number, number>> => {
    // This would ideally come from backend aggregation
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
};

// Get recent reviews (last N reviews)
export const getRecentReviews = async (storeId: string, limit: number = 5): Promise<StoreReview[]> => {
    try {
        const result = await reviewsApi.getByStore(storeId, { limit });
        return result.reviews.map(r => ({
            id: r._id || '',
            storeId: r.storeId,
            rating: r.rating,
            comment: r.comment,
            customerName: r.customerName,
            customerEmail: r.customerEmail,
            createdAt: r.createdAt || new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error fetching recent reviews:', error);
        return [];
    }
};

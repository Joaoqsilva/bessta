import api from './api';

export const licenseApi = {
    // Admin: Generate keys
    generateKeys: async (plan: string, count: number = 1, expiresAt?: string) => {
        const response = await api.post('/licenses/generate', { plan, count, expiresAt });
        return response.data;
    },

    // Admin: List keys
    listKeys: async (filters: { status?: string; plan?: string; limit?: number } = {}) => {
        const response = await api.get('/licenses', { params: filters });
        return response.data;
    },

    // Admin: Revoke key
    revokeKey: async (id: string) => {
        const response = await api.delete(`/licenses/${id}`);
        return response.data;
    },

    // User: Activate key
    activateKey: async (key: string) => {
        const response = await api.post('/licenses/activate', { key });
        return response.data;
    }
};

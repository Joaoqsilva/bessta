// ========================================
// DOMAIN API SERVICE
// Frontend service for domain management
// ========================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface DomainRecord {
    id: string;
    storeId: string;
    domain: string;
    verified: boolean;
    verificationCode: string;
    sslStatus: 'pending' | 'active' | 'failed';
    dnsStatus: 'pending' | 'configured' | 'failed';
    createdAt: string;
    verifiedAt?: string;
    lastCheckAt?: string;
}

export interface DomainResponse {
    success: boolean;
    domain?: DomainRecord;
    error?: string;
    dnsInstructions?: {
        type: string;
        name: string;
        value: string;
        note: string;
    };
}

export interface DNSCheckResponse {
    success: boolean;
    configured: boolean;
    cnames: string[];
    message: string;
}

/**
 * Add a custom domain for a store
 */
export async function addCustomDomain(storeId: string, domain: string): Promise<DomainResponse> {
    try {
        const token = localStorage.getItem('bookme_token');
        const headers: any = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/domains`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ storeId, domain }),
        });

        // Check if response has content
        const text = await response.text();

        if (!response.ok && !text) {
            return {
                success: false,
                error: `Erro ${response.status}: ${response.statusText || 'Servidor não respondeu'}`,
            };
        }

        if (!text) {
            return {
                success: false,
                error: 'Servidor retornou resposta vazia',
            };
        }

        try {
            const data = JSON.parse(text);
            return data;
        } catch (parseError) {
            console.error('Failed to parse response:', text);
            return {
                success: false,
                error: 'Resposta inválida do servidor',
            };
        }
    } catch (error: any) {
        console.error('Domain API error:', error);
        return {
            success: false,
            error: error.message || 'Erro ao adicionar domínio',
        };
    }
}

/**
 * Get domain configuration for a store
 */
export async function getStoreDomain(storeId: string): Promise<DomainResponse> {
    try {
        const token = localStorage.getItem('bookme_token');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/domains/store/${storeId}`, {
            headers
        });
        const data = await response.json();
        return data;
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Erro ao buscar domínio',
        };
    }
}

/**
 * Verify DNS configuration for a domain
 */
export async function verifyDomainDNS(domainId: string): Promise<{
    success: boolean;
    verified: boolean;
    message: string;
    cnames?: string[];
}> {
    try {
        const token = localStorage.getItem('bookme_token');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/domains/${domainId}/verify`, {
            method: 'POST',
            headers
        });
        const data = await response.json();
        return data;
    } catch (error: any) {
        return {
            success: false,
            verified: false,
            message: error.message || 'Erro ao verificar DNS',
        };
    }
}

/**
 * Quick DNS check without saving (for real-time feedback)
 */
export async function checkDNS(domain: string): Promise<DNSCheckResponse> {
    try {
        const response = await fetch(`${API_BASE}/domains/check-dns/${domain}`);
        const data = await response.json();
        return data;
    } catch (error: any) {
        return {
            success: false,
            configured: false,
            cnames: [],
            message: error.message || 'Erro ao verificar DNS',
        };
    }
}

/**
 * Delete a custom domain
 */
export async function deleteCustomDomain(domainId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const token = localStorage.getItem('bookme_token');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/domains/${domainId}`, {
            method: 'DELETE',
            headers
        });
        const data = await response.json();
        return data;
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Erro ao remover domínio',
        };
    }
}

/**
 * Format domain for display
 */
export function formatDomain(domain: string): string {
    return domain
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
}

/**
 * Validate domain format
 * Requires full domain with TLD (like .com, .net, etc)
 */
export function isValidDomain(domain: string): boolean {
    const cleaned = formatDomain(domain);
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(cleaned);
}

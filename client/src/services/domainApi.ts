// ========================================
// DOMAIN API SERVICE
// Frontend service for domain management
// ========================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
        const response = await fetch(`${API_BASE}/domains`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ storeId, domain }),
        });

        const data = await response.json();
        return data;
    } catch (error: any) {
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
        const response = await fetch(`${API_BASE}/domains/store/${storeId}`);
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
        const response = await fetch(`${API_BASE}/domains/${domainId}/verify`, {
            method: 'POST',
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
        const response = await fetch(`${API_BASE}/domains/${domainId}`, {
            method: 'DELETE',
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
 */
export function isValidDomain(domain: string): boolean {
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(formatDomain(domain));
}

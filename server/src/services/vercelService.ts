// ========================================
// VERCEL API SERVICE
// Integração com Vercel para domínios
// ========================================

import axios from 'axios';

// Get from environment variables
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || '';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || ''; // Optional

const vercelApi = axios.create({
    baseURL: 'https://api.vercel.com',
    headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

// Types
interface VercelDomainResponse {
    name: string;
    apexName: string;
    projectId: string;
    redirect?: string;
    redirectStatusCode?: number;
    gitBranch?: string;
    updatedAt?: number;
    createdAt?: number;
    verified: boolean;
    verification?: VercelDomainVerification[];
}

interface VercelDomainVerification {
    type: string;
    domain: string;
    value: string;
    reason: string;
}

interface VercelDomainConfig {
    configuredBy?: string;
    acceptedChallenges?: string[];
    misconfigured: boolean;
}

/**
 * Add a domain to the Vercel project
 */
export async function addDomainToVercel(domain: string): Promise<{
    success: boolean;
    data?: VercelDomainResponse;
    error?: string;
    verification?: VercelDomainVerification[];
}> {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        console.warn('Vercel API credentials not configured');
        return {
            success: false,
            error: 'Vercel API não configurada. Configure VERCEL_TOKEN e VERCEL_PROJECT_ID.'
        };
    }

    try {
        const url = VERCEL_TEAM_ID
            ? `/v10/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
            : `/v10/projects/${VERCEL_PROJECT_ID}/domains`;

        const response = await vercelApi.post(url, {
            name: domain,
        });

        return {
            success: true,
            data: response.data,
            verification: response.data.verification,
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message;

        // Handle specific Vercel errors
        if (error.response?.status === 409) {
            return {
                success: false,
                error: 'Este domínio já está configurado em outro projeto Vercel.'
            };
        }

        if (error.response?.status === 403) {
            return {
                success: false,
                error: 'Sem permissão para adicionar domínio. Verifique o token Vercel.'
            };
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Remove a domain from the Vercel project
 */
export async function removeDomainFromVercel(domain: string): Promise<{
    success: boolean;
    error?: string;
}> {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        return { success: false, error: 'Vercel API não configurada' };
    }

    try {
        const url = VERCEL_TEAM_ID
            ? `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`
            : `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`;

        await vercelApi.delete(url);
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
}

/**
 * Get domain configuration from Vercel
 */
export async function getDomainConfig(domain: string): Promise<{
    success: boolean;
    data?: VercelDomainConfig;
    error?: string;
}> {
    if (!VERCEL_TOKEN) {
        return { success: false, error: 'Vercel API não configurada' };
    }

    try {
        const url = VERCEL_TEAM_ID
            ? `/v6/domains/${domain}/config?teamId=${VERCEL_TEAM_ID}`
            : `/v6/domains/${domain}/config`;

        const response = await vercelApi.get(url);
        return {
            success: true,
            data: response.data
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
}

/**
 * Verify domain configuration on Vercel
 */
export async function verifyDomainOnVercel(domain: string): Promise<{
    success: boolean;
    verified: boolean;
    error?: string;
}> {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        return { success: false, verified: false, error: 'Vercel API não configurada' };
    }

    try {
        const url = VERCEL_TEAM_ID
            ? `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify?teamId=${VERCEL_TEAM_ID}`
            : `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify`;

        const response = await vercelApi.post(url);
        return {
            success: true,
            verified: response.data.verified === true
        };
    } catch (error: any) {
        return {
            success: false,
            verified: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
}

/**
 * Get all domains from Vercel project
 */
export async function getVercelDomains(): Promise<{
    success: boolean;
    domains?: VercelDomainResponse[];
    error?: string;
}> {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        return { success: false, error: 'Vercel API não configurada' };
    }

    try {
        const url = VERCEL_TEAM_ID
            ? `/v9/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
            : `/v9/projects/${VERCEL_PROJECT_ID}/domains`;

        const response = await vercelApi.get(url);
        return {
            success: true,
            domains: response.data.domains
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
}

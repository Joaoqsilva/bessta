// ========================================
// DOMAIN SERVICE
// MongoDB-based domain management
// ========================================

import dns from 'dns';
import { promisify } from 'util';
import { Domain, IDomain } from '../models/Domain';
import { Store } from '../models/Store';
import { v4 as uuidv4 } from 'uuid';

const resolveCname = promisify(dns.resolveCname);

// Expected CNAME target for Vercel
const VERCEL_CNAME_TARGET = 'cname.vercel-dns.com';

/**
 * Generate a unique verification code
 */
function generateVerificationCode(): string {
    return `bessta-verify-${uuidv4().slice(0, 8)}`;
}

/**
 * Normalize domain (remove protocol, www, trailing slash)
 */
function normalizeDomain(domain: string): string {
    return domain
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .trim();
}

/**
 * Add a new domain for a store
 */
export async function addDomain(storeId: string, domain: string): Promise<IDomain> {
    const normalizedDomain = normalizeDomain(domain);

    // Check if domain is already registered
    const existingDomain = await Domain.findOne({ domain: normalizedDomain });
    if (existingDomain) {
        throw new Error('Este domínio já está em uso por outra loja');
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
        throw new Error('Loja não encontrada');
    }

    // Check if store already has a domain
    const existingStoreDomain = await Domain.findOne({ storeId });
    if (existingStoreDomain) {
        // Update existing domain
        existingStoreDomain.domain = normalizedDomain;
        existingStoreDomain.verified = false;
        existingStoreDomain.dnsStatus = 'pending';
        existingStoreDomain.sslStatus = 'pending';
        existingStoreDomain.verificationCode = generateVerificationCode();
        await existingStoreDomain.save();

        // Update store
        store.customDomain = normalizedDomain;
        store.domainVerified = false;
        await store.save();

        return existingStoreDomain;
    }

    // Create new domain record
    const domainRecord = new Domain({
        storeId,
        domain: normalizedDomain,
        verificationCode: generateVerificationCode(),
    });

    await domainRecord.save();

    // Update store
    store.customDomain = normalizedDomain;
    store.domainVerified = false;
    store.domainVerificationCode = domainRecord.verificationCode;
    await store.save();

    return domainRecord;
}

/**
 * Get domain by store ID
 */
export async function getDomainByStoreId(storeId: string): Promise<IDomain | null> {
    return Domain.findOne({ storeId });
}

/**
 * Get domain by domain name (for routing)
 */
export async function getDomainByName(domainName: string): Promise<IDomain | null> {
    const normalized = normalizeDomain(domainName);
    return Domain.findOne({ domain: normalized, verified: true });
}

/**
 * Get store by domain (for routing)
 */
export async function getStoreByDomain(domainName: string) {
    const normalized = normalizeDomain(domainName);
    const domain = await Domain.findOne({ domain: normalized, verified: true });

    if (!domain) {
        return null;
    }

    return Store.findById(domain.storeId);
}

/**
 * Verify DNS configuration
 */
export async function verifyDNS(domainId: string): Promise<{
    success: boolean;
    message: string;
    cnames?: string[];
}> {
    const domain = await Domain.findById(domainId);
    if (!domain) {
        return { success: false, message: 'Domínio não encontrado' };
    }

    try {
        const cnames = await resolveCname(domain.domain);

        const hasVercelCname = cnames.some(cname =>
            cname.toLowerCase().includes('vercel') ||
            cname.toLowerCase() === VERCEL_CNAME_TARGET ||
            cname.toLowerCase().endsWith('.vercel-dns.com')
        );

        if (hasVercelCname) {
            // Update domain status
            domain.dnsStatus = 'configured';
            domain.verified = true;
            domain.verifiedAt = new Date();
            domain.lastCheckAt = new Date();
            await domain.save();

            // Update store
            await Store.findByIdAndUpdate(domain.storeId, {
                domainVerified: true
            });

            return {
                success: true,
                message: 'DNS configurado corretamente! Seu domínio está ativo.',
                cnames
            };
        } else {
            domain.dnsStatus = 'pending';
            domain.lastCheckAt = new Date();
            await domain.save();

            return {
                success: false,
                message: `CNAME encontrado mas não aponta para Vercel. Encontrado: ${cnames.join(', ')}. Esperado: ${VERCEL_CNAME_TARGET}`,
                cnames
            };
        }
    } catch (error: any) {
        domain.lastCheckAt = new Date();
        await domain.save();

        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return {
                success: false,
                message: 'Registro CNAME não encontrado. Configure o DNS conforme as instruções.'
            };
        }

        return {
            success: false,
            message: `Erro ao verificar DNS: ${error.message}`
        };
    }
}

/**
 * Delete a domain
 */
export async function deleteDomain(domainId: string): Promise<boolean> {
    const domain = await Domain.findById(domainId);
    if (!domain) {
        return false;
    }

    // Clear domain from store
    await Store.findByIdAndUpdate(domain.storeId, {
        customDomain: null,
        domainVerified: false,
        domainVerificationCode: null
    });

    await Domain.findByIdAndDelete(domainId);
    return true;
}

/**
 * Get all domains (for admin)
 */
export async function getAllDomains(): Promise<IDomain[]> {
    return Domain.find().populate('storeId', 'name slug').sort({ createdAt: -1 });
}

/**
 * Quick DNS check without saving
 */
export async function checkDNS(domain: string): Promise<{
    configured: boolean;
    cnames: string[];
    message: string;
}> {
    const normalized = normalizeDomain(domain);

    try {
        const cnames = await resolveCname(normalized);
        const hasVercelCname = cnames.some(cname =>
            cname.toLowerCase().includes('vercel') ||
            cname.toLowerCase().endsWith('.vercel-dns.com')
        );

        return {
            configured: hasVercelCname,
            cnames,
            message: hasVercelCname
                ? 'DNS configurado corretamente!'
                : `CNAME encontrado: ${cnames.join(', ')}. Esperado: ${VERCEL_CNAME_TARGET}`
        };
    } catch (error: any) {
        return {
            configured: false,
            cnames: [],
            message: 'Registro CNAME não encontrado. Configure o DNS conforme as instruções.'
        };
    }
}

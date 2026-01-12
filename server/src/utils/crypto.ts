import crypto from 'crypto';

// Get key from environment
// Must be 32 chars (256 bits)
const ALGORITHM = 'aes-256-cbc'; // Using CBC for compatibility, GCM is better but more complex to setup simple IVs
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // Must be 32 chars
const IV_LENGTH = 16; // AES block size

/**
 * Encrypts text
 */
export function encrypt(text: string): string {
    if (!text) return text;
    if (!ENCRYPTION_KEY) {
        console.warn('⚠️ ENCRYPTION_KEY not set. Data saved in cleartext.');
        return text;
    }
    if (ENCRYPTION_KEY.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be 32 characters long');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Return as iv:encrypted_content
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts text
 */
export function decrypt(text: string): string {
    if (!text) return text;
    if (!ENCRYPTION_KEY) return text;

    // Split iv:content
    const parts = text.split(':');
    if (parts.length !== 2) {
        // Not encrypted or invalid format, return original (backward compatibility)
        return text;
    }

    try {
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (error) {
        // Failed to decrypt (wrong key? corrupted?)
        console.error('Decryption failed:', error);
        return text; // Fallback to returning raw text rather than crashing
    }
}

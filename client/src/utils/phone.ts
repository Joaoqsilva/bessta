/**
 * Utility functions for phone number handling
 */

/**
 * Formats a phone number for WhatsApp link usage.
 * Removes all non-digit characters and ensures the number starts with country code.
 * 
 * @param phone - The phone number string (can include formatting like (47) 99139-4589)
 * @param defaultCountryCode - Default country code to prepend if not present (default: '55' for Brazil)
 * @returns The formatted phone number (e.g., '5547991394589')
 */
export const formatPhoneForWhatsApp = (phone?: string | null, defaultCountryCode: string = '55'): string => {
    if (!phone) return '';

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    if (!digitsOnly) return '';

    // If the number already starts with the country code (55 for Brazil), return as is
    // Brazilian numbers are typically 10-11 digits without country code
    if (digitsOnly.length >= 12 && digitsOnly.startsWith(defaultCountryCode)) {
        return digitsOnly;
    }

    // If it's a local number (9-11 digits), prepend the country code
    if (digitsOnly.length >= 9 && digitsOnly.length <= 11) {
        return `${defaultCountryCode}${digitsOnly}`;
    }

    // Return as is for other cases
    return digitsOnly;
};

/**
 * Generates a WhatsApp link with the formatted phone number.
 * 
 * @param phone - The phone number string
 * @param message - Optional pre-filled message for the chat
 * @returns The full WhatsApp URL (e.g., 'https://wa.me/5547991394589?text=Hello')
 */
export const getWhatsAppLink = (phone?: string | null, message?: string): string => {
    const formattedPhone = formatPhoneForWhatsApp(phone);

    if (!formattedPhone) {
        // Fallback to a default number or return empty
        return '';
    }

    const baseUrl = `https://wa.me/${formattedPhone}`;

    if (message) {
        return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }

    return baseUrl;
};

/**
 * Generates a tel: link for phone calls.
 * 
 * @param phone - The phone number string
 * @returns The tel: URL (e.g., 'tel:+5547991394589')
 */
export const getTelLink = (phone?: string | null): string => {
    const formattedPhone = formatPhoneForWhatsApp(phone);

    if (!formattedPhone) {
        return '';
    }

    return `tel:+${formattedPhone}`;
};

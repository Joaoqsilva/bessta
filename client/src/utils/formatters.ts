export const formatPhone = (value: string): string => {
    // Remove characters that are not digits
    const digits = value.replace(/\D/g, '');

    // Limit to 11 digits
    const cleanValue = digits.slice(0, 11);

    // Apply formatting
    if (cleanValue.length <= 2) return cleanValue;
    if (cleanValue.length <= 7) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;

    // (XX) XXXXX-XXXX
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7)}`;
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1280px',
            },
        },
        extend: {
            colors: {
                // Direct Color Mapping to match existing classes
                primary: {
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    200: 'var(--primary-200)',
                    300: 'var(--primary-300)',
                    400: 'var(--primary-400)',
                    500: 'var(--primary-500)',
                    600: 'var(--primary-600)',
                    700: 'var(--primary-700)',
                    800: 'var(--primary-800)',
                    900: 'var(--primary-900)',
                    DEFAULT: 'var(--primary-600)', // Enables 'bg-primary', 'text-primary'
                },
                accent: {
                    50: 'var(--accent-50)',
                    100: 'var(--accent-100)',
                    500: 'var(--accent-500)',
                    600: 'var(--accent-600)',
                    DEFAULT: 'var(--accent-500)', // Enables 'bg-accent', 'text-accent'
                },
                success: {
                    50: 'var(--success-50)',
                    100: 'var(--success-100)',
                    200: 'var(--success-200)',
                    500: 'var(--success-500)',
                    600: 'var(--success-600)',
                    700: 'var(--success-700)',
                    DEFAULT: 'var(--success-600)', // Enables 'bg-success', 'text-success'
                },
                warning: {
                    50: 'var(--warning-50)',
                    100: 'var(--warning-100)',
                    200: 'var(--warning-200)',
                    500: 'var(--warning-500)',
                    600: 'var(--warning-600)',
                    700: 'var(--warning-700)',
                    DEFAULT: 'var(--warning-600)',
                },
                info: {
                    50: 'var(--info-50)',
                    100: 'var(--info-100)',
                    200: 'var(--info-200)',
                    500: 'var(--info-500)',
                    600: 'var(--info-600)',
                    700: 'var(--info-700)',
                    DEFAULT: 'var(--info-600)',
                },
                error: {
                    50: 'var(--error-50)',
                    100: 'var(--error-100)',
                    500: 'var(--error-500)',
                    600: 'var(--error-600)',
                    DEFAULT: 'var(--error-600)',
                },
                surface: {
                    0: 'var(--surface-0)',
                    50: 'var(--surface-50)',
                    100: 'var(--surface-100)',
                    200: 'var(--surface-200)',
                    300: 'var(--surface-300)',
                    400: 'var(--surface-400)',
                    500: 'var(--surface-500)',
                    600: 'var(--surface-600)',
                    700: 'var(--surface-700)',
                    800: 'var(--surface-800)',
                    900: 'var(--surface-900)',
                    950: 'var(--surface-950)',
                },
                // Fix for text-* classes
                main: 'var(--text-main)', // Enables 'text-main', 'bg-main', etc.
                secondary: 'var(--text-secondary)',
                muted: 'var(--text-muted)',
                light: 'var(--text-light)',
                'on-primary': 'var(--text-on-primary)',
                white: '#ffffff',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            borderRadius: {
                'none': 'var(--radius-none)',
                'sm': 'var(--radius-sm)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
                '3xl': 'var(--radius-3xl)',
                'full': 'var(--radius-full)',
            },
            boxShadow: {
                'xs': 'var(--shadow-xs)',
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
                '2xl': 'var(--shadow-2xl)',
                'inner': 'var(--shadow-inner)',
                'glow': 'var(--shadow-glow)',
            }
        },
    },
    plugins: [],
}

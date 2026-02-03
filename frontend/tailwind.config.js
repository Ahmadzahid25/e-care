/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#2152ff', // Main Blue
                    600: '#1a44d4', // Hover
                    700: '#1437a8',
                    800: '#0f2a7d',
                    900: '#0a1d52',
                    950: '#051030',
                },
                secondary: {
                    50: '#f8f9fa',
                    100: '#f8f9fa',
                    200: '#e9ecef',
                    300: '#dee2e6',
                    400: '#ced4da',
                    500: '#adb5bd',
                    600: '#6c757d',
                    700: '#495057',
                    800: '#343a40',
                    900: '#212529',
                },
                dark: {
                    900: '#0f172a',
                    800: '#1e293b',
                    700: '#334155',
                    600: '#475569',
                },
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)',
                'gradient-info': 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)',
                'gradient-success': 'linear-gradient(310deg, #17ad37 0%, #98ec2d 100%)',
                'gradient-warning': 'linear-gradient(310deg, #f53939 0%, #fbcf33 100%)',
                'gradient-danger': 'linear-gradient(310deg, #ea0606 0%, #ff667c 100%)',
            },
            boxShadow: {
                'soft-xl': '0 20px 27px 0 rgba(0, 0, 0, 0.05)',
                'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}

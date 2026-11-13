import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        serein: {
          bg: '#EDE8E1',
          paper: '#FAF8F5',
          card: '#FFFFFF',
          dark: '#2C2825',
          muted: '#7E776F',
          taupe: '#4A453F',
          border: '#E5E0D8',
          accent: '#A38C75',
        },
        gold: {
          50: '#fbf9f4',
          100: '#f6f2e6',
          200: '#ebe1cb',
          300: '#dccea8',
          400: '#caa86f',
          500: '#bc934b',
          600: '#a67d3b',
          700: '#846030',
          800: '#694c2a',
          900: '#553e26',
        },
        rose: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#f87171',
          500: '#e03131',
        },
        pearl: '#FAF8F5',
        charcoal: '#1A1D20',
        cream: '#FDFBF7',
      },
      fontFamily: {
        laisha: ['laisharegular', 'Playfair Display', 'Georgia', 'serif'],
        serif: ['laisharegular', 'var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        cursive: ['var(--font-alex-brush)', 'Brush Script MT', 'cursive'],
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.03)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette for better dark mode support
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        surface: {
          light: 'rgba(255, 255, 255, 0.8)',
          'light-hover': 'rgba(255, 255, 255, 0.9)',
          dark: 'rgba(15, 23, 42, 0.8)',
          'dark-hover': 'rgba(30, 41, 59, 0.9)',
        },
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #fdf4ff 50%, #fce7f3 75%, #fef3f2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #312e81 50%, #581c87 75%, #7c2d12 100%)',
        'gradient-dynamic-light': 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 25%, #fdf4ff 50%, #fae8ff 75%, #f0abfc 100%)',
        'gradient-dynamic-dark': 'linear-gradient(135deg, #0c1426 0%, #1e1b4b 25%, #312e81 50%, #4c1d95 75%, #581c87 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

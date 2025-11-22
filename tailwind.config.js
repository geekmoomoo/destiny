/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif KR"', 'serif'], // Main Mystical Font
        sans: ['"Pretendard"', 'sans-serif'], // UI Font
      },
      colors: {
        void: {
          950: '#050508', // Deep Dark Navy-Black
          900: '#0a0a12',
          800: '#121220',
          700: '#1a1a2e',
        },
        gold: {
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fbbf24',
          500: '#d4af37', // Antique Gold
          600: '#b4942b',
        },
        tarot: {
          frame: '#151520', // Dark card frame color
          border: '#2a2a3d', // Lighter border
        }
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'shimmer-slow': 'shimmer 3s linear infinite',
        'reveal': 'reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        reveal: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        }
      },
      backgroundImage: {
        'card-texture': "url('https://www.transparenttextures.com/patterns/stardust.png')",
        'gold-gradient': 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)',
      }
    },
  },
  plugins: [],
}
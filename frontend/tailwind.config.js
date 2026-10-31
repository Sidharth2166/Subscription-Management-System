/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-0': '#030504',
        'bg-1': '#050706',
        'bg-2': '#0B1710',
        'surface': '#101C14',
        'card': '#122017',
        'green-500': '#12C94B',
        'green-400': '#3DE06A',
        'neon': '#55FF76',
        'lime-glow': '#B6FF5C',
        'green-900': '#0A3B1B',
        'text-1': '#F3F7F3',
        'text-2': '#98A69B',
        'text-3': '#5F6E63',
        'success': '#22E27A',
        'warning': '#FFB020',
        'danger': '#FF5C5C',
        'info': '#4DD6C1',
        'glass-border': 'rgba(85, 255, 118, 0.12)',
        'glass-border-strong': 'rgba(85, 255, 118, 0.28)',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'input': '12px',
        'card': '20px',
        'hero': '28px',
        'pill': '9999px',
      },
      boxShadow: {
        'neon-glow': '0 0 24px rgba(85, 255, 118, 0.45)',
        'neon-glow-lg': '0 0 50px rgba(85, 255, 118, 0.55)',
        'glass-card': '0 20px 60px -20px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'bottom-glow': '0 15px 40px -10px rgba(18, 201, 75, 0.55)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

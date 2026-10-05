/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sym: {
          navy: '#012a6c',
          'navy-dark': '#001542',
          gold: '#fed501',
          'gold-dark': '#c9aa01',
          'gold-light': '#fde68a',
          'gold-hover': '#e6c001',
          surface: '#f5f6fa',
          muted: '#6b7280',
          'navy-tint': '#E8EEF7',
          cream: '#f7f6f2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

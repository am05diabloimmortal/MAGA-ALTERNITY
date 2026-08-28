/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Obsidian / charcoal base scale
        obsidian: {
          50: '#f4f4f3',
          100: '#e3e2e0',
          200: '#c4c1bd',
          300: '#9c9892',
          400: '#6e6a64',
          500: '#4a4742',
          600: '#33312d',
          700: '#26241f',
          800: '#1a1815',
          900: '#121110',
          950: '#0a0908',
        },
        // Dark crimson accent scale
        crimson: {
          50: '#fdf2f2',
          100: '#f9d4d4',
          200: '#f0a8a8',
          300: '#e27272',
          400: '#cc4545',
          500: '#a82d2d',
          600: '#861f1f',
          700: '#661515',
          800: '#4a0f0f',
          900: '#330a0a',
          950: '#1f0606',
        },
        // Ember / gold accent
        ember: {
          50: '#fdf8ed',
          100: '#f7e9c4',
          200: '#ecd08a',
          300: '#ddb055',
          400: '#c8922f',
          500: '#a87520',
          600: '#85591b',
          700: '#644318',
          800: '#433014',
          900: '#2a1d0c',
        },
        blood: '#7a0c0c',
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'inner-glow': 'inset 0 0 24px 0 rgba(168, 45, 45, 0.15)',
        'crimson-glow': '0 0 18px 0 rgba(168, 45, 45, 0.35)',
        'ember-glow': '0 0 18px 0 rgba(200, 146, 47, 0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px 0 rgba(168, 45, 45, 0.25)' },
          '50%': { boxShadow: '0 0 22px 0 rgba(168, 45, 45, 0.55)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

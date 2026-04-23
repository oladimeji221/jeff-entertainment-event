/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fire:          '#FF6B00',
        'fire-mid':    '#FF9A00',
        'fire-bright': '#FFD400',
        ice:           '#00D4F5',
        'ice-mid':     '#4DD9F5',
        'ice-bright':  '#A8F0FF',
        nature:        '#2D7A20',
        'nature-light':'#4CAF50',
        'dark-950':    '#080502',
        'dark-900':    '#0F0804',
        'dark-800':    '#1A1008',
        'dark-700':    '#231508',
        'dark-600':    '#2E1C0A',
        'dark-500':    '#3D2510',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'float':      'float 6s ease-in-out infinite',
        'pulse-fire': 'pulseFire 2.5s ease-in-out infinite',
        'pulse-ice':  'pulseIce 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-15px)' },
        },
        pulseFire: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,0,0.3)' },
          '50%':      { boxShadow: '0 0 50px rgba(255,107,0,0.7), 0 0 100px rgba(255,107,0,0.2)' },
        },
        pulseIce: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,245,0.3)' },
          '50%':      { boxShadow: '0 0 50px rgba(0,212,245,0.7), 0 0 100px rgba(0,212,245,0.2)' },
        },
      },
    },
  },
  plugins: [],
}

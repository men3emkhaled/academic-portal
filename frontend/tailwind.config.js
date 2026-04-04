/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2ecc71',
        primaryLight: '#58d68d',
        primaryDark: '#27ae60',
        secondary: '#1abc9c',
        success: '#2ecc71',
        danger: '#e74c3c',
        warning: '#f39c12',
        dark: '#0a0a0a',
        'dark-card': '#111111',
        'dark-glass': 'rgba(17, 17, 17, 0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(46, 204, 113, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(46, 204, 113, 0.5)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
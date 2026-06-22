/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        primaryLight: '#34d399',
        primaryDark: '#047857',
        secondary: '#1abc9c',
        success: '#2ecc71',
        danger: '#e74c3c',
        warning: '#f39c12',
        dark: 'var(--bg-main)',
        'dark-card': 'var(--doctor-card)',
        'dark-glass': 'rgba(17, 17, 17, 0.7)',
        'doctor-bg': 'var(--doctor-bg)',
        'doctor-sidebar': 'var(--doctor-sidebar)',
        'doctor-card': 'var(--doctor-card)',
        'doctor-text': 'var(--doctor-text)',
        'doctor-text-muted': 'var(--doctor-text-muted)',
        'doctor-primary': '#8b5cf6',
        'doctor-secondary': '#a78bfa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fadeIn': 'fadeIn 0.1s ease-out forwards',
        'fadeInUp': 'fadeInUp 0.15s ease-out forwards',
        'slideInRight': 'slideInRight 0.15s ease-out forwards',
        'slideInLeft': 'slideInLeft 0.15s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(5, 150, 105, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(5, 150, 105, 0.5)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        fadeInUp: {
          'from': { opacity: '0', top: '10px' },
          'to': { opacity: '1', top: '0' },
        },
        slideInRight: {
          '0%': { opacity: '0', left: '8px' },
          '100%': { opacity: '1', left: '0' },
        },
        slideInLeft: {
          '0%': { opacity: '0', left: '-8px' },
          '100%': { opacity: '1', left: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
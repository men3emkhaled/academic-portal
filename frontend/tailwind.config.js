/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: '#39ff14',
        dark: '#0a0a0a',
        'dark-card': '#111111',
        'dark-glass': 'rgba(17, 17, 17, 0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(57,255,20,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(57,255,20,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
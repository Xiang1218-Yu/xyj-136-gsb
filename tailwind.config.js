/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': '#0a0e27',
        'space-blue': '#1a1f4e',
        'forest-green': '#2d5a27',
        'glacier-blue': '#87ceeb',
        'city-gold': '#ffa500',
        'grass-green': '#7cfc00',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'noto': ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(135, 206, 235, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(135, 206, 235, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

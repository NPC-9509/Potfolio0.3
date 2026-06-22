/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#04010a',
        'bg-card': 'rgba(8, 2, 18, 0.92)',
        'bg-panel-dark': '#070312',
        text: '#ffffff',
        'text-muted': '#b9adc6',
        'accent-purple': '#bd5af7',
        'accent-cyan': '#00e5ff',
        'accent-pink': '#ff2a85',
        'accent-green': '#00ff66',
        'accent-yellow': '#ffe600',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        termFade: 'termFade 1.2s forwards',
        wavePulse: 'wavePulse 0.8s ease-in-out infinite alternate',
        glitch: 'glitch 0.8s infinite',
        flicker: 'flicker 3s infinite',
        scanline: 'scanline 8s linear infinite',
        neonPulse: 'neonPulse 2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        aiDot: 'aiDot 1.4s ease-in-out infinite',
        progressGlow: 'progressGlow 2s ease-in-out infinite',
        bootPulse: 'bootPulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        termFade: { to: { opacity: '1' } },
        wavePulse: {
          '0%': { height: '3px' },
          '100%': { height: '14px' },
        },
      },
      boxShadow: {
        'cyber': '0 8px 32px 0 rgba(4, 1, 10, 0.37)',
        'cyber-cyan': '0 8px 32px 0 rgba(4, 1, 10, 0.37), 0 0 15px rgba(0, 229, 255, 0.1)',
        'cyber-purple': '0 8px 32px 0 rgba(4, 1, 10, 0.37), 0 0 15px rgba(189, 90, 247, 0.1)',
        'cyber-pink': '0 8px 32px 0 rgba(4, 1, 10, 0.37), 0 0 15px rgba(255, 42, 133, 0.1)',
        'cyber-green': '0 8px 32px 0 rgba(4, 1, 10, 0.37), 0 0 15px rgba(0, 255, 102, 0.15)',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        obsidian: '#06070a', graphite: '#0c1017', steel: '#151b26', line: '#232b3a', electric: '#4f8cff', cyan: '#36d3ff', success: '#40d875', review: '#ffd166', danger: '#ff5c7a', muted: '#8b98ad'
      },
      boxShadow: {
        glow: '0 0 40px rgba(79, 140, 255, 0.18)',
        panel: '0 24px 80px rgba(0,0,0,0.45)'
      },
      backgroundImage: {
        'industrial-grid': 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
export default config;

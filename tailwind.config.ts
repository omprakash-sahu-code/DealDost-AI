import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'deal-onyx': '#0D0D0D',
        'deal-gold': '#D4AF37',
        'deal-gold-muted': '#C5A059',
        'deal-silk': '#F5F5F4'
      },
      fontFamily: {
        'syne': ['var(--font-syne)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'playfair': ['var(--font-playfair)', 'serif'],
        'garet': ['Garet', 'sans-serif'],
      },
      animation: {
        'reveal-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gold-glow': 'goldPulse 2s infinite alternate',
        'float-slow': 'antiGravity 4s ease-in-out infinite'
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        goldPulse: {
          '0%': { boxShadow: '0 0 10px rgba(212,175,55,0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(212,175,55,0.6)' }
        },
        antiGravity: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' }
        }
      }
    },
  },
  plugins: [],
};
export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0d0d1c',
          1: '#141428',
          2: '#1c1c38',
          3: '#24243c',
          4: '#2e2e50'
        },
        ink: {
          1: '#ddddf0',
          2: '#9090c0',
          3: '#55558a'
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#5b21b6'
        },
        pulse: {
          DEFAULT: '#10d4a0',
          light: '#34d399'
        },
        warn: '#fbbf24',
        danger: '#f87171'
      },
      fontFamily: {
        display: ['"EB Garamond"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', '"Courier New"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
        'spin-slow': 'spin 1.5s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.75)' }
        }
      },
      borderColor: {
        subtle: 'rgba(140, 140, 220, 0.08)',
        strong: 'rgba(140, 140, 220, 0.16)'
      }
    }
  },
  plugins: []
};

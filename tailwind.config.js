/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'var(--ds-ink-950)',
          900: 'var(--ds-ink-900)',
          850: 'var(--ds-ink-850)',
          800: 'var(--ds-ink-800)',
          700: 'var(--ds-ink-700)',
          600: 'var(--ds-ink-600)',
          500: 'var(--ds-ink-500)',
        },
        paper: {
          50: 'var(--ds-paper-50)',
          200: 'var(--ds-paper-200)',
          300: 'var(--ds-paper-300)',
        },
        accent: {
          DEFAULT: 'var(--ds-accent)',
          bright: 'var(--ds-accent-bright)',
          soft: 'var(--ds-accent-soft)',
        },
        background: 'hsl(var(--ds-bg))',
        foreground: 'hsl(var(--ds-fg))',
        card: 'hsl(var(--ds-card))',
        surface: 'hsl(var(--ds-surface))',
        muted: 'hsl(var(--ds-muted))',
      },
      borderRadius: {
        ds: 'var(--ds-radius-md)',
        'ds-lg': 'var(--ds-radius-lg)',
        'ds-xl': 'var(--ds-radius-xl)',
        'ds-2xl': 'var(--ds-radius-2xl)',
      },
      boxShadow: {
        ds: 'var(--ds-shadow-sm)',
        'ds-md': 'var(--ds-shadow-md)',
        'ds-modal': 'var(--ds-shadow-modal)',
        'ds-inset': 'var(--ds-inset-glow)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionDuration: {
        instant: '150ms',
        fast: '200ms',
        base: '300ms',
      },
      transitionTimingFunction: {
        ds: 'cubic-bezier(0, 0, 0.2, 1)',
        fluent: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s cubic-bezier(0, 0, 0.2, 1) both',
        shimmer: 'shimmer 1.4s ease infinite',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

// Tokens fonte única: design-system.md (Constitution Principle III)
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      coffee: {
        950: '#1c130d',
        900: '#2c1c12',
        700: '#5a3d2b',
        500: '#8a5a3b',
        300: '#c9a789',
        100: '#f1e4d8',
        50: '#faf6f1',
      },
      amber: {
        700: '#94540a',
        600: '#b5680d',
      },
      red: {
        600: '#c0392b',
      },
      green: {
        600: '#1e7e42',
      },
    },
    fontFamily: {
      sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    spacing: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
    },
    borderRadius: {
      none: '0px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgb(28 19 13 / 0.06)',
      none: 'none',
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;

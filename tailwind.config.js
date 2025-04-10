/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'sns-button',
    'sns-button-twitter',
    'sns-button-line',
    'sns-button-instagram',
    'sns-button-facebook',
    'sns-share-grid',
    'bg-giver-light',
    'bg-giver',
    'bg-giver-dark',
    'bg-matcher-light',
    'bg-matcher',
    'bg-matcher-dark',
    'bg-taker-light',
    'bg-taker',
    'bg-taker-dark',
    'text-giver',
    'text-matcher',
    'text-taker',
  ],
  theme: {
    extend: {
      colors: {
        'giver': {
          light: '#8B5CF6',
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
        },
        'matcher': {
          light: '#3B82F6',
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        'taker': {
          light: '#F59E0B',
          DEFAULT: '#D97706',
          dark: '#B45309',
        },
        'success': '#10B981',
        'warning': '#F97316',
        'error': '#EF4444',
        'surface': {
          light: '#F9FAFB',
          DEFAULT: '#F3F4F6',
          dark: '#E5E7EB',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        supporter: {
          DEFAULT: 'var(--color-supporter)',
          light: 'var(--color-supporter-light)',
          dark: 'var(--color-supporter-dark)',
        },
        cooperative: {
          DEFAULT: 'var(--color-cooperative)',
          light: 'var(--color-cooperative-light)',
          dark: 'var(--color-cooperative-dark)',
        },
        balanced: {
          DEFAULT: 'var(--color-balanced)',
          light: 'var(--color-balanced-light)',
          dark: 'var(--color-balanced-dark)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'M PLUS Rounded 1c', 'sans-serif'],
        rounded: ['M PLUS Rounded 1c', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-1': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-large': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-small': ['0.875rem', { lineHeight: '1.5' }],
      },
      backgroundImage: {
        'mesh': 'linear-gradient(to right bottom, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))',
        'giver-gradient': 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(109, 40, 217, 0.05))',
        'matcher-gradient': 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05))',
        'taker-gradient': 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(180, 83, 9, 0.05))',
      },
    },
  },
  plugins: [],
} 
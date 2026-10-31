import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.ts',
    './app/plugins/**/*.ts',
    './app/app.vue',
    './app/error.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cozy RPG Hearth & Wood Ground
        wood: {
          950: '#120D0B', // Deepest night campfire ground
          900: '#1A1411', // Tavern floor / main background
          850: '#231B17', // Wooden panel surface
          800: '#2E231E', // Elevated card / wooden chest
          750: '#3D2F29', // Board rim & divider
          700: '#523F36', // Wood highlight border
          600: '#70574B', // Light wood trim
        },
        // Antique Parchment / Scroll Paper (High legibility for Hanzi & cards)
        parchment: {
          50: '#FCF9F2',
          100: '#FAF5EB', // Pure parchment surface
          200: '#F4EBDA', // Aged paper
          300: '#EBDDC5', // Scroll border / darker paper
          400: '#DFCCA9',
          ink: '#261C14', // Ink text on parchment (AAA contrast)
          'ink-muted': '#6B5749',
        },
        // Dragon Cinnabar Seal Red
        dragon: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626', // Vermilion stamp red
          700: '#B91C1C', // 3D bevel bottom border
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        // Imperial Gold & Coins
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Main coin gold
          600: '#D97706', // 3D bevel border
          700: '#B45309', // Deep bronze
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        // Jade Mastery & Healing Potion
        jade: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Jade green
          600: '#059669', // 3D bevel border
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // Mana Azure & Wisdom
        mana: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        rpg: ['"Marcellus"', '"Noto Serif SC"', 'serif'],
        heading: ['"Outfit"', 'sans-serif'],
        hanzi: ['"Noto Serif SC"', '"Songti SC"', '"Source Han Serif SC"', 'serif'],
      },
      boxShadow: {
        'rpg-card': '0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'rpg-card-lift': '0 14px 32px -4px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(245, 158, 11, 0.25)',
        'rpg-glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.45)',
        'rpg-glow-dragon': '0 0 20px -3px rgba(220, 38, 38, 0.45)',
        'rpg-glow-jade': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'parchment-shadow': '0 4px 20px -2px rgba(38, 28, 20, 0.25), inset 0 0 15px rgba(223, 204, 169, 0.3)',
      },
      borderRadius: {
        'rpg-sm': '10px',
        'rpg': '16px',
        'rpg-lg': '24px',
        'rpg-xl': '32px',
      },
    },
  },
  plugins: [],
} satisfies Config;

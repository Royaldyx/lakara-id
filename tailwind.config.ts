import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        lakara: {
          50:  '#eef1ff',
          100: '#e0e5ff',
          200: '#c7ceff',
          300: '#a5aeff',
          400: '#8085fd',
          500: '#6166fa',
          600: '#3358ff',
          700: '#3a42e8',
          800: '#2f36bb',
          900: '#2b3393',
          950: '#191d56',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './services/**/*.{js,jsx,ts,tsx}',
    './store/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        chuka: {
          50: '#edf8ed',
          100: '#d9f0d9',
          200: '#b7e2b7',
          300: '#8fce8f',
          400: '#5fad5f',
          500: '#228B22',
          600: '#1e7a1e',
          700: '#0f670f',
          800: '#006400',
          900: '#004d00',
        },
        surface: '#F5F5F5',
        ink: '#1A1A1A',
      },
      boxShadow: {
        soft: '0 20px 50px rgba(0, 100, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

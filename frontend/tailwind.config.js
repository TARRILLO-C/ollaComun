/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          500: '#2e7d32',
          600: '#1b5e20',
          700: '#154a19',
        }
      }
    },
  },
  plugins: [],
};


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          dark: 'var(--background-dark)'
        },
        text: {
          DEFAULT: 'var(--text)',
          dark: 'var(--text-dark)'
        }
      }
    },
  },
  plugins: [],
}
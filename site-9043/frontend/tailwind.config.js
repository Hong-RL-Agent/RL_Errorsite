/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          beige: '#F5F5F4',
          dark: '#1C1917',
          gold: '#A89276'
        }
      }
    },
  },
  plugins: [],
}
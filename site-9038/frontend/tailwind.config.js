module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f9fafb',
          900: '#0a0e27',
          800: '#111827',
          700: '#1a202c'
        },
        accent: {
          green: '#10b981',
          red: '#ef4444',
          blue: '#3b82f6',
          cyan: '#06b6d4'
        }
      }
    }
  },
  plugins: []
}

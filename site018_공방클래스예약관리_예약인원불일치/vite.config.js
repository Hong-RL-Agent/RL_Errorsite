import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9517,
    proxy: {
      '/api': {
        target: 'http://localhost:5017',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9523,
    proxy: {
      '/api': {
        target: 'http://localhost:5023',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

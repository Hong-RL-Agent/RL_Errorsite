import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9529,
    proxy: {
      '/api': {
        target: 'http://localhost:5030',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

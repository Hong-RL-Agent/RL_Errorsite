import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9534,
    proxy: {
      '/api': {
        target: 'http://localhost:5035',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

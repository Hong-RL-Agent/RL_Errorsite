import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9560,
    proxy: {
      '/api': {
        target: 'http://localhost:5061',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5183,
    proxy: {
      '/api': {
        target: 'http://localhost:9229',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})

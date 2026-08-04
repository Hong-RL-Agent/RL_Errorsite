import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5177,
    proxy: {
      '/api': {
        target: 'http://localhost:9223',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})

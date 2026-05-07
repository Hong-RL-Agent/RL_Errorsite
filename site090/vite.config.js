import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9199,
    proxy: {
      '/api': {
        target: 'http://localhost:9199',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})

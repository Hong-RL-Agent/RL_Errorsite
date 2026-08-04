import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5182,
    proxy: {
      '/api': {
        target: 'http://localhost:9228',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})

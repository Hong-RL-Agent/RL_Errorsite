import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9130,
    proxy: {
      '/api': {
        target: 'http://localhost:9130',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})

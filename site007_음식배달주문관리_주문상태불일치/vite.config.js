import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9506,
    proxy: {
      '/api': {
        target: 'http://localhost:5006',
        changeOrigin: true,
        secure: false
      },
      '/images': {
        target: 'http://localhost:5006',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9528,
    proxy: {
      '/api': {
        target: 'http://localhost:5029',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

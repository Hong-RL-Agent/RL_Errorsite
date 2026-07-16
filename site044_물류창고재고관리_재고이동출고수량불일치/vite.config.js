import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9543,
    proxy: {
      '/api': {
        target: 'http://localhost:5044',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9561,
    proxy: {
      '/api': {
        target: 'http://localhost:5062',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

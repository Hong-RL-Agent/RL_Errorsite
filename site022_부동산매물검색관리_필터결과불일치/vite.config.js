import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9521,
    proxy: {
      '/api': {
        target: 'http://localhost:5021',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9524,
    proxy: {
      '/api': {
        target: 'http://localhost:5024',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9541,
    proxy: {
      '/api': {
        target: 'http://localhost:5042',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9558,
    proxy: {
      '/api': {
        target: 'http://localhost:5059',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9537,
    proxy: {
      '/api': {
        target: 'http://localhost:5038',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

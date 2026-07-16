import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9519,
    proxy: {
      '/api': {
        target: 'http://localhost:5019',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

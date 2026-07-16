import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9533,
    proxy: {
      '/api': {
        target: 'http://localhost:5034',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

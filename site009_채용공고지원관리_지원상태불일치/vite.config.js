import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 9508,
    proxy: {
      '/api': {
        target: 'http://localhost:5008',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5008',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 9513,
    proxy: {
      '/api': {
        target: 'http://localhost:5013',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

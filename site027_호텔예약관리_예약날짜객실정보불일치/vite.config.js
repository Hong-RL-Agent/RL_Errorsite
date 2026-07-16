import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 9526,
    proxy: {
      '/api': {
        target: 'http://localhost:5027',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

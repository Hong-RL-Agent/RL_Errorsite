import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 9553,
    proxy: {
      '/api': {
        target: 'http://localhost:5054',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

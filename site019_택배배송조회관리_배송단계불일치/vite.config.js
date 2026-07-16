import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 9518,
    proxy: {
      '/api': {
        target: 'http://localhost:5018',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 9522,
    proxy: {
      '/api': {
        target: 'http://localhost:5022',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

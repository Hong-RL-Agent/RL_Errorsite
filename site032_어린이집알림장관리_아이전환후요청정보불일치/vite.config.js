import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 9531,
    proxy: {
      '/api': {
        target: 'http://localhost:5032',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

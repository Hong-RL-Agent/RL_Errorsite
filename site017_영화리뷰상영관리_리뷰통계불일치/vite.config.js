import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 9516,
    proxy: {
      '/api': {
        target: 'http://localhost:5016',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

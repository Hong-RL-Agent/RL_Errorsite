import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9138,
    proxy: {
      '/api': 'http://localhost:9155' // Backend moved to 9155
    }
  }
})

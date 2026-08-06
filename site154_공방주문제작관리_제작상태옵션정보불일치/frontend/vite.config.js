import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5254,
    proxy: { '/api': { target: 'http://localhost:9653', changeOrigin: true } }
  }
});

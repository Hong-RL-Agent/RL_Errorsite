import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5255,
    proxy: { '/api': { target: 'http://localhost:9654', changeOrigin: true } }
  }
});

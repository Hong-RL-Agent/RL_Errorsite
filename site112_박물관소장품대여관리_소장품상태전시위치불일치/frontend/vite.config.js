import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5212,
    proxy: { '/api': { target: 'http://localhost:9611', changeOrigin: true } }
  }
});

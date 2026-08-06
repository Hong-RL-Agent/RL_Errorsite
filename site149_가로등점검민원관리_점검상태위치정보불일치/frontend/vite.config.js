import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5249,
    proxy: { '/api': { target: 'http://localhost:9648', changeOrigin: true } }
  }
});

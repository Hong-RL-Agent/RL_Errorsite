import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5237,
    proxy: { '/api': { target: 'http://localhost:9636', changeOrigin: true } }
  }
});

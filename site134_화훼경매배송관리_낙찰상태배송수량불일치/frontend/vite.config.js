import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5234,
    proxy: { '/api': { target: 'http://localhost:9633', changeOrigin: true } }
  }
});

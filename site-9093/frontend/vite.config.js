import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 9093,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9093',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:9093',
        ws: true,
        changeOrigin: true
      }
    }
  }
});

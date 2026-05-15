import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9064',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: 9064,
    strictPort: true
  },
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true
  }
});

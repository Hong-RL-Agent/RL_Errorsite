import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5205,
    proxy: {
      '/api': {
        target: 'http://localhost:9604',
        changeOrigin: true
      }
    }
  }
});

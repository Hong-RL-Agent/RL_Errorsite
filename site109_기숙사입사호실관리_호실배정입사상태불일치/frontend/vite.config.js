import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5209,
    proxy: {
      '/api': {
        target: 'http://localhost:9608',
        changeOrigin: true
      }
    }
  }
});

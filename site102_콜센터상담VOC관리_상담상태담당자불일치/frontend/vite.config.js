import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5202,
    proxy: {
      '/api': {
        target: 'http://localhost:9601',
        changeOrigin: true
      }
    }
  }
});

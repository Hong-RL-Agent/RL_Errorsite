import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9157,
    proxy: {
      '/api': {
        target: 'http://localhost:9158',
        changeOrigin: true
      }
    }
  }
});

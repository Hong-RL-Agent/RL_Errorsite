import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9934,
    proxy: {
      '/api': {
        target: 'http://localhost:9934',
        changeOrigin: true
      }
    }
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9709,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9809',
        changeOrigin: true
      }
    }
  }
});

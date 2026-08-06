import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5194,
    proxy: {
      '/api': {
        target: 'http://localhost:9593',
        changeOrigin: true
      }
    }
  }
});

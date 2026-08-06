import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5250,
    proxy: { '/api': { target: 'http://localhost:9649', changeOrigin: true } }
  }
});

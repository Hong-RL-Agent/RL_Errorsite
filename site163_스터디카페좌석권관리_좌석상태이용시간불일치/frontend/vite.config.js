import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5263,
    proxy: { '/api': { target: 'http://localhost:9662', changeOrigin: true } }
  }
});

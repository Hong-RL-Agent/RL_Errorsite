import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5222,
    proxy: { '/api': { target: 'http://localhost:9621', changeOrigin: true } }
  }
});

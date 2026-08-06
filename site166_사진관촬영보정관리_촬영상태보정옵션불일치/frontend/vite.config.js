import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5266,
    proxy: { '/api': { target: 'http://localhost:9665', changeOrigin: true } }
  }
});

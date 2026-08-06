import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5256,
    proxy: { '/api': { target: 'http://localhost:9655', changeOrigin: true } }
  }
});

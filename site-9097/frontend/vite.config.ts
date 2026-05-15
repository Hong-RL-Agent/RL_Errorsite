import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 9097,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.WM_BACKEND_ORIGIN ?? 'http://localhost:9097',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-WM-Proxy-Trace', 'vite-proxy-9097');
          });
        }
      }
    }
  }
});

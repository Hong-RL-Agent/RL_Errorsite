import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  const proxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:9063';
  const proxyOrigin = process.env.VITE_PROXY_ORIGIN ?? 'http://localhost:5173';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          headers: {
            Origin: proxyOrigin
          }
        }
      },
      headers: {
        'X-Frame-Options': 'SAMEORIGIN'
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 4173
    }
  };
});

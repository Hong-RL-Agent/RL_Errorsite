import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '0.0.0.0',
        port: 9078,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:9078',
                changeOrigin: true,
                secure: false
            }
        }
    },
    preview: {
        host: '0.0.0.0',
        port: 9078,
        strictPort: true
    }
});

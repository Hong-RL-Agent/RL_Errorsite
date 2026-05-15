import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 9055,
    proxy: {
      '/api': 'http://localhost:8080',
      '/actuator': 'http://localhost:8080'
    }
  }
});

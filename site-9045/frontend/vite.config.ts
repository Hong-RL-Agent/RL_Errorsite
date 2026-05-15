import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 9045, // 여기서 포트 번호를 9045로 고정!
    strictPort: true, // 9045번이 이미 사용 중이면 에러를 내도록 설정
    host: true
  }
});
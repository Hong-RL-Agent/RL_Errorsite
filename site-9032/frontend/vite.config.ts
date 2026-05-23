import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 로컬 테스트용 (Docker 시 Nginx가 처리)
        changeOrigin: true,
      }
    }
  }
})

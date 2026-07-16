import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9507,
    proxy: {
      '/api': {
        target: 'http://localhost:5007',
        changeOrigin: true,
        secure: false
      }
      // 의도적으로 '/booking-api' 경로에 대한 프록시 처리를 누락합니다 (Error 5)
    }
  }
})

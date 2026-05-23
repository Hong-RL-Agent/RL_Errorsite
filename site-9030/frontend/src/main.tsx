import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // 🚀 여기서 index.css가 모든 스타일을 덮어써야 합니다.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
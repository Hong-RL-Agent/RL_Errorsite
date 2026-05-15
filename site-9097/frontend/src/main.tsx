import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?stale-cache-fault=1').catch(() => {
      console.warn('WASTE-MGMT service worker registration failed');
    });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from 'react';

export default function Toast({ toasts = [] }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          {t.type === 'success' && '🥕 '}
          {t.type === 'error' && '✕ '}
          {t.type === 'info' && 'ℹ '}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

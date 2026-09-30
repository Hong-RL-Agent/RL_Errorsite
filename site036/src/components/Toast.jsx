import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`}>
          {t.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
          {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          {(!t.type || t.type === 'info') && <Info size={18} color="#6366f1" />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.title || '알림'}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>{t.message}</div>
            {t.txId && (
              <div style={{ fontSize: '0.74rem', color: '#a5b4fc', marginTop: '4px', fontFamily: 'monospace' }}>
                Ref: {t.txId}
              </div>
            )}
          </div>
          <button 
            onClick={() => removeToast(t.id)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

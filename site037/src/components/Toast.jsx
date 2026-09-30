import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`}>
          {t.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
          {t.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
          {(!t.type || t.type === 'info') && <Info size={20} color="#a855f7" />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span>{t.title || '알림'}</span>
              {(t.bugId || t.secId) && (
                <span style={{ 
                  backgroundColor: '#7e22ce', 
                  color: '#ffffff', 
                  fontSize: '0.72rem', 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {t.secId || t.bugId}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.84rem', opacity: 0.95, marginTop: '3px' }}>{t.message}</div>
            
            {(t.bugId || t.txId) && (
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.76rem', color: '#e9d5ff', fontFamily: 'monospace' }}>
                {t.bugId && <div><strong>Bug ID:</strong> {t.bugId} ({t.secId})</div>}
                {t.txId && <div><strong>Transaction ID:</strong> {t.txId}</div>}
              </div>
            )}
          </div>
          <button 
            onClick={() => removeToast(t.id)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

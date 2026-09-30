import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

export default function Toast({ toast, onClose, toasts, removeToast }) {
  // Support both single toast and array of toasts
  const toastList = toasts || (toast ? [toast] : []);
  const handleClose = removeToast || onClose || (() => {});

  useEffect(() => {
    if (toastList.length > 0) {
      const timer = setTimeout(() => {
        if (toastList[0]?.id) {
          handleClose(toastList[0].id);
        } else {
          handleClose();
        }
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [toastList]);

  if (toastList.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '440px',
      width: 'calc(100vw - 48px)',
      pointerEvents: 'none'
    }}>
      {toastList.map((t, idx) => {
        const id = t.id || idx;
        return (
          <div
            key={id}
            style={{
              pointerEvents: 'auto',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.45), 0 8px 16px -4px rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.3))',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a5b4fc',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {t.type === 'error' ? <AlertCircle size={20} color="#f43f5e" /> : <Sparkles size={20} color="#818cf8" />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                  {t.title || '작업 처리 완료'}
                </span>

                {(t.bugId || t.secId) && (
                  <span style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.02em',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    whiteSpace: 'nowrap'
                  }}>
                    {t.secId || t.bugId}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.45, marginBottom: (t.bugId || t.txId) ? '8px' : '0' }}>
                {t.message}
              </p>

              {(t.bugId || t.txId) && (
                <div style={{
                  padding: '8px 10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  fontSize: '0.75rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                }}>
                  {t.bugId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}>
                      <span>Bug Code:</span>
                      <strong>{t.bugId} {t.secId ? `(${t.secId})` : ''}</strong>
                    </div>
                  )}
                  {t.txId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a7f3d0' }}>
                      <span>Tx ID:</span>
                      <strong>{t.txId}</strong>
                    </div>
                  )}
                  {t.idempotency_key && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fed7aa' }}>
                      <span>Key:</span>
                      <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>{t.idempotency_key}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => handleClose(id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

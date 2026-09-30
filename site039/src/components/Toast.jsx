import React, { useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, X, Clock } from 'lucide-react';

export default function Toast({ toast, onClose, toasts, removeToast }) {
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
      }, 5000);
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
      maxWidth: '430px',
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
              background: '#242220',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '16px 18px',
              boxShadow: '0 18px 32px -4px rgba(36, 34, 32, 0.45), 0 6px 14px -2px rgba(147, 86, 56, 0.25)',
              border: '1px solid rgba(188, 108, 37, 0.35)',
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
              background: 'linear-gradient(135deg, rgba(188, 108, 37, 0.25), rgba(92, 107, 75, 0.3))',
              border: '1px solid rgba(188, 108, 37, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {t.type === 'error' ? <AlertCircle size={20} color="#f43f5e" /> : <Sparkles size={20} color="#fbbf24" />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                  {t.title || '작업 완료'}
                </span>

                {(t.bugId || t.secId) && (
                  <span style={{
                    background: 'linear-gradient(135deg, #bc6c25 0%, #935638 100%)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(188, 108, 37, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    whiteSpace: 'nowrap'
                  }}>
                    {t.secId || t.bugId}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.84rem', color: '#d6d3d1', lineHeight: 1.45, marginBottom: (t.bugId || t.reqId) ? '8px' : '0' }}>
                {t.message}
              </p>

              {(t.bugId || t.reqId) && (
                <div style={{
                  padding: '7px 10px',
                  background: 'rgba(20, 18, 17, 0.85)',
                  borderRadius: '7px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  fontSize: '0.74rem',
                  fontFamily: 'ui-monospace, monospace'
                }}>
                  {t.bugId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fdba74' }}>
                      <span>Bug Code:</span>
                      <strong>{t.bugId} {t.secId ? `(${t.secId})` : ''}</strong>
                    </div>
                  )}
                  {t.reqId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a7f3d0' }}>
                      <span>Request ID:</span>
                      <strong>{t.reqId}</strong>
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
                color: '#a8a29e',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#a8a29e'}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

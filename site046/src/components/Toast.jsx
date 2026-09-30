import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Normal toast events
    const handleCustomToast = (e) => {
      const { title, message, type = 'info' } = e.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, message, type, isBug: false }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    // Bug detected events
    const handleBugDetected = (e) => {
      const bug = e.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev,
        {
          id,
          title: `[${bug.secId || bug.bugId}] ${bug.type || '시스템 로직 알림'}`,
          message: bug.message || '상태 처리 중 이상 로직이 감지되었습니다.',
          type: 'warning',
          isBug: true,
          bugId: bug.bugId,
          secId: bug.secId
        }
      ]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    };

    window.addEventListener('freshcart-toast', handleCustomToast);
    window.addEventListener('freshcart-bug-detected', handleBugDetected);

    return () => {
      window.removeEventListener('freshcart-toast', handleCustomToast);
      window.removeEventListener('freshcart-bug-detected', handleBugDetected);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-box ${t.isBug ? 'bug-alert' : t.type}`}>
          <div style={{ marginTop: '2px' }}>
            {t.isBug ? (
              <AlertTriangle size={18} color="#f59e0b" />
            ) : t.type === 'error' ? (
              <AlertTriangle size={18} color="#ef4444" />
            ) : (
              <CheckCircle size={18} color="#10b981" />
            )}
          </div>
          <div className="toast-content">
            <div className="toast-title">{t.title}</div>
            <div className="toast-message">{t.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function showToast(title, message, type = 'info') {
  window.dispatchEvent(
    new CustomEvent('freshcart-toast', {
      detail: { title, message, type }
    })
  );
}

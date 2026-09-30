import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X, Clock } from 'lucide-react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleCustomToast = (e) => {
      const { title, message, type = 'info' } = e.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, message, type, isBug: false }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };

    const handleBugDetected = (e) => {
      const bug = e.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev,
        {
          id,
          title: `[${bug.secId || bug.bugId}] ${bug.type || '비동기 처리 상태 알림'}`,
          message: bug.message || '요청이 진행되었으나 처리 상태가 지연되었습니다.',
          type: 'warning',
          isBug: true,
          bugId: bug.bugId,
          secId: bug.secId
        }
      ]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
    };

    window.addEventListener('pawmate-toast', handleCustomToast);
    window.addEventListener('pawmate-bug-detected', handleBugDetected);

    return () => {
      window.removeEventListener('pawmate-toast', handleCustomToast);
      window.removeEventListener('pawmate-bug-detected', handleBugDetected);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-box ${t.isBug ? 'bug-alert' : t.type}`}>
          <div style={{ marginTop: '2px' }}>
            {t.isBug ? (
              <Clock size={18} color="#f4a261" />
            ) : t.type === 'error' ? (
              <AlertCircle size={18} color="#e63946" />
            ) : (
              <CheckCircle size={18} color="#2d6a4f" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '2px', color: '#1b261e' }}>{t.title}</div>
            <div style={{ fontSize: '12.5px', color: '#526156' }}>{t.message}</div>
          </div>
          <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} style={{ color: '#8d99ae' }}>
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function showToast(title, message, type = 'info') {
  window.dispatchEvent(
    new CustomEvent('pawmate-toast', {
      detail: { title, message, type }
    })
  );
}

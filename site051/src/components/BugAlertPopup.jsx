import React, { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function BugAlertPopup() {
  const [activeBug, setActiveBug] = useState(null);

  useEffect(() => {
    const handleBug = (e) => {
      if (e.detail) {
        setActiveBug(e.detail);
      }
    };

    window.addEventListener('triplog-bug-detected', handleBug);
    return () => window.removeEventListener('triplog-bug-detected', handleBug);
  }, []);

  if (!activeBug) return null;

  return (
    <div className="bug-alert-popup-overlay">
      <div className="bug-alert-card">
        <div className="bug-alert-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#f59e0b" />
            <span className="bug-badge-tag">{activeBug.id ? `[${activeBug.id}]` : '오류 감지'}</span>
          </div>
          <button 
            className="icon-button" 
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#94a3b8' }}
            onClick={() => setActiveBug(null)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="bug-alert-title">
          {activeBug.category ? `[${activeBug.category}] ${activeBug.family || ''}` : '시스템 상태 알림'}
        </div>

        <p className="bug-alert-message">
          {activeBug.message || '요청 처리 중 비정상적인 데이터 상태가 감지되었습니다.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="bug-alert-close-btn" onClick={() => setActiveBug(null)}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

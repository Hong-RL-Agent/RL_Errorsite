import React, { useState, useEffect } from 'react';

export default function BugAlertPopup() {
  const [activeBug, setActiveBug] = useState(null);

  useEffect(() => {
    const handleBug = (e) => {
      if (e.detail) {
        setActiveBug(e.detail);
        const timer = setTimeout(() => {
          setActiveBug(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('booknest-bug-detected', handleBug);
    return () => window.removeEventListener('booknest-bug-detected', handleBug);
  }, []);

  if (!activeBug) return null;

  return (
    <div className="bug-alert-container">
      <div className="bug-alert-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="bug-badge-tag">[{activeBug.id || 'SEC-ANOMALY'}]</span>
          <button 
            onClick={() => setActiveBug(null)}
            style={{ color: '#b7e4c7', fontSize: '1.1rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#fbfbfa', marginBottom: '4px' }}>
          시스템 비즈니스 로직 / 상태 이상 감지
        </div>
        <div style={{ fontSize: '0.85rem', color: '#d8f3dc', lineHeight: '1.45', marginBottom: '10px' }}>
          {activeBug.description || '도서관 플랫폼 처리 중 비정상적인 데이터 연산/경계 상태가 감지되었습니다.'}
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#b7e4c7', flexWrap: 'wrap' }}>
          {activeBug.category && <span style={{ background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '4px' }}>Cat: {activeBug.category}</span>}
          {activeBug.family && <span style={{ background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '4px' }}>Family: {activeBug.family}</span>}
          {activeBug.endpoint && <span style={{ background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '4px' }}>{activeBug.method} {activeBug.endpoint}</span>}
        </div>
      </div>
    </div>
  );
}

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

    window.addEventListener('nearbuy-bug-detected', handleBug);
    return () => window.removeEventListener('nearbuy-bug-detected', handleBug);
  }, []);

  if (!activeBug) return null;

  return (
    <div className="bug-alert-container">
      <div className="bug-alert-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="bug-badge-tag">[{activeBug.id || 'SEC-ANOMALY'}]</span>
          <button 
            onClick={() => setActiveBug(null)}
            style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffedd5', marginBottom: '4px' }}>
          시스템 데이터 상태 이상 감지
        </div>
        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '10px' }}>
          {activeBug.description || '요청 처리 중 비정상적인 데이터 매핑/정규화 상태가 감지되었습니다.'}
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
          {activeBug.category && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Cat: {activeBug.category}</span>}
          {activeBug.family && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Family: {activeBug.family}</span>}
          {activeBug.endpoint && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{activeBug.method} {activeBug.endpoint}</span>}
        </div>
      </div>
    </div>
  );
}

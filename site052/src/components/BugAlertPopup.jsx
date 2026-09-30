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

    window.addEventListener('spacemate-bug-detected', handleBug);
    return () => window.removeEventListener('spacemate-bug-detected', handleBug);
  }, []);

  if (!activeBug) return null;

  return (
    <div className="bug-alert-fixed">
      <div className="bug-alert-header">
        <span className="bug-tag">[{activeBug.id || 'SEC-ANOMALY'}]</span>
        <button 
          onClick={() => setActiveBug(null)}
          style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
      <div className="bug-title">시스템 상태 이상 감지</div>
      <div className="bug-desc">
        {activeBug.description || '작업 요청 처리 중 예상치 못한 상태 불일치가 감지되었습니다.'}
      </div>
      <div className="bug-meta-row">
        {activeBug.category && <span className="bug-meta-pill">Cat: {activeBug.category}</span>}
        {activeBug.family && <span className="bug-meta-pill">Family: {activeBug.family}</span>}
        {activeBug.endpoint && <span className="bug-meta-pill">{activeBug.method} {activeBug.endpoint}</span>}
      </div>
    </div>
  );
}

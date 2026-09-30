import React, { useState, useEffect } from 'react';

export default function BugAlertPopup() {
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    const handleBug = (e) => {
      if (e && e.detail) {
        setBugs((prev) => {
          // Avoid duplicate display of same bug instance in rapid succession
          const exists = prev.some((b) => b.id === e.detail.id && Date.now() - (b.timestamp || 0) < 2000);
          if (exists) return prev;
          return [...prev, { ...e.detail, timestamp: Date.now(), uid: Math.random().toString(36).substring(2, 9) }];
        });
      }
    };

    window.addEventListener('culturepick-bug-detected', handleBug);
    return () => window.removeEventListener('culturepick-bug-detected', handleBug);
  }, []);

  const dismissBug = (uid) => {
    setBugs((prev) => prev.filter((b) => b.uid !== uid));
  };

  if (bugs.length === 0) return null;

  return (
    <div className="bug-alert-container">
      {bugs.map((bug) => (
        <div key={bug.uid} className="bug-alert-card">
          <div className="bug-alert-header">
            <span className="bug-badge-tag">[{bug.id}]</span>
            <span className="bug-category-tag">{bug.category || 'System Error'}</span>
            <button
              className="bug-close-btn"
              onClick={() => dismissBug(bug.uid)}
              title="닫기"
            >
              ✕
            </button>
          </div>
          <p className="bug-alert-desc">{bug.description || '시스템 이상 동작이 감지되었습니다.'}</p>
          <div className="bug-alert-meta">
            <span>위치: {bug.endpoint || bug.file || 'Client UI'}</span>
            <span>분류: {bug.family || 'interaction'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

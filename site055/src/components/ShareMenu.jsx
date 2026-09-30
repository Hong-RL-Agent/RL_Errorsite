import React, { useState } from 'react';

export default function ShareMenu({ modalId, eventTitle, onClose, onCopyLink }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    if (onCopyLink) onCopyLink();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialMock = (platform) => {
    alert(`${platform} 공유창으로 이동합니다. (Mock 동작)`);
  };

  return (
    <div className="share-menu-modal-overlay" onClick={onClose}>
      <div className="share-menu-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-modal-title-box">
            <span className="share-icon-badge">🔗</span>
            <h4 className="share-modal-title">공연 공유하기</h4>
          </div>
          <button className="share-modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <p className="share-event-title">{eventTitle}</p>

        <div className="share-options-grid">
          <button className="share-option-btn kakao-btn" onClick={() => handleSocialMock('카카오톡')}>
            <span className="share-btn-icon">💬</span>
            <span className="share-btn-label">카카오톡</span>
          </button>
          
          <button className="share-option-btn x-btn" onClick={() => handleSocialMock('X(트위터)')}>
            <span className="share-btn-icon">𝕏</span>
            <span className="share-btn-label">트위터 (X)</span>
          </button>
          
          <button className="share-option-btn fb-btn" onClick={() => handleSocialMock('페이스북')}>
            <span className="share-btn-icon">📘</span>
            <span className="share-btn-label">페이스북</span>
          </button>
        </div>

        <div className="share-url-copy-box">
          <input
            type="text"
            readOnly
            value={window.location.href}
            className="share-url-input"
          />
          <button className="share-copy-btn" onClick={handleCopy}>
            {copied ? '✓ 복사됨!' : '링크 복사'}
          </button>
        </div>
      </div>
    </div>
  );
}

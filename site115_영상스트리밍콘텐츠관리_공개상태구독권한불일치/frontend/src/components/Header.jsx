import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingReviews, cachedRecentContent, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span className="logo-title">StreamAdmin</span>
        <span className="logo-subtitle">OTT 영상 스트리밍 콘텐츠 & 구독 권한 통합 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🎬 검수 대기 콘텐츠:<strong className="stat-value">{cachedPendingReviews}건</strong></div>
          <div className="stat-card">📺 최근 등록 콘텐츠:<strong className="stat-value-alert">{cachedRecentContent}</strong></div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 콘텐츠 목록은 B 권한 기준 변경되나 상단 검수 대기 수 및 최근 콘텐츠 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="ADM-1001">김영상 OTT 총괄 PD (관리자 A)</option>
            <option value="ADM-1002">이스트림 라이선스 수석 (관리자 B)</option>
            <option value="ADM-1003">박검수 심의관 (콘텐츠 심의)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 스트리밍 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingCount, cachedRecentBook, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="logo-title">BookDonate</span>
        <span className="logo-subtitle">공공 도서 기증 접수 · KDC 분류 · 나눔 배포처 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📚 KDC 분류 대기 기증도서:<strong className="stat-value">{cachedPendingCount}권</strong></div>
          <div className="stat-card">📖 대표 기증 장서:<strong className="stat-value-alert">{cachedRecentBook}</strong></div>
        </div>
        <small className="warn-desc">* 담당 사서(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 분류대기 수 및 주요 도서 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 사서:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-6001">김기증 수석사서 (담당자 A)</option>
            <option value="STF-6002">이분류 목록사서 (담당자 B)</option>
            <option value="STF-6003">박배포 지원원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 도서 DB 리셋</button>
      </div>
    </header>
  );
}

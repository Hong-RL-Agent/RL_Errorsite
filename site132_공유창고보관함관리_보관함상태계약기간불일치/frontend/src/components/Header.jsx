import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedExpiringCount, cachedRecentLocker, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <span className="logo-title">BoxSpace</span>
        <span className="logo-subtitle">스마트 셀프 공유창고 · 24h 출입 입출고 · 보관함 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📦 계약 만료 임박 보관함:<strong className="stat-value">{cachedExpiringCount}건</strong></div>
          <div className="stat-card">🔒 최고 점유 지점 보관함:<strong className="stat-value-alert">{cachedRecentLocker}</strong></div>
        </div>
        <small className="warn-desc">* 담당 직원(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 만료예정 수 및 최근 보관함 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 직원:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-1001">김창고 강남점장 (직원 A)</option>
            <option value="STF-1002">이보관 홍대팀장 (직원 B)</option>
            <option value="STF-1003">박스마트 보안원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 창고 DB 리셋</button>
      </div>
    </header>
  );
}

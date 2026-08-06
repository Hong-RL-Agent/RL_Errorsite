import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPending, cachedRecentContainer, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
        </svg>
        <span className="logo-title">PortStack</span>
        <span className="logo-subtitle">Port Container Yard & Vessel Loading Ops Console</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card"><span>🚢 선적 대기 컨테이너:</span><strong className="stat-value">{cachedPending}개</strong></div>
          <div className="stat-card"><span>📦 최근 컨테이너:</span><strong className="stat-value-alert">{cachedRecentContainer}</strong></div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 컨테이너 목록은 B 권한으로 바뀌나 상단 선적 대기 수 및 최근 컨테이너 알림은 A 캐시가 남음 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 직원:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STAFF-7001">김항만 관제장 (부두 운영 총괄 - 직원 A)</option>
            <option value="STAFF-7002">이선적 감독관 (선적 작업 감독 - 직원 B)</option>
            <option value="STAFF-7014">권VTS 관제사 (VTS 관제센터)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 항만 DB 리셋</button>
      </div>
    </header>
  );
}

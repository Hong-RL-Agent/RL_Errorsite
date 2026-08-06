import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedBrokenCount, cachedRecentCharger, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="logo-title">ChargeGrid</span>
        <span className="logo-subtitle">전기차 충전소 인프라 · 충전기 상태 · 예약 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">⚡ 고장/점검 충전기:<strong className="stat-value-alert">{cachedBrokenCount}대</strong></div>
          <div className="stat-card">🔌 최근 상태 변경:<strong className="stat-value">{cachedRecentCharger}</strong></div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 고장 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-5001">김충전 운영총괄 (관리자 A)</option>
            <option value="STF-5002">이점검 팀장 (관리자 B)</option>
            <option value="STF-5003">박관제 센터장</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 충전 DB 리셋</button>
      </div>
    </header>
  );
}

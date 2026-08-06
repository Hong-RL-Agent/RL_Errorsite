import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingCount, cachedRecentRequest, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="logo-title">DronePermit</span>
        <span className="logo-subtitle">드론 항공 촬영 의뢰 · 비행 관제 승인 · 영공 안전 관리 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🛸 승인 대기 중 비행 신청:<strong className="stat-value">{cachedPendingCount}건</strong></div>
          <div className="stat-card">📡 주요 제한구역 촬영 신청:<strong className="stat-value-alert">{cachedRecentRequest}</strong></div>
        </div>
        <small className="warn-desc">* 관리자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 승인대기 수 및 주요 의뢰 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-7001">김항공 총괄승인관 (관리자 A)</option>
            <option value="STF-7002">이조종 관제팀장 (관리자 B)</option>
            <option value="STF-7003">박승인 심의관</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 영공 관제 DB 리셋</button>
      </div>
    </header>
  );
}

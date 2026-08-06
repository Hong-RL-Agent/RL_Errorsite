import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedShipmentPendingCount, cachedRecentLivestock, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="logo-title">FarmHerd</span>
        <span className="logo-subtitle">스마트 축산 농장 개체 관리 · 사료 재고 · 출하 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🐄 출하 대기 개체:<strong className="stat-value">{cachedShipmentPendingCount}두</strong></div>
          <div className="stat-card">🌾 사료 재고 잔량:<strong className="stat-value-alert">{cachedRecentLivestock}</strong></div>
        </div>
        <small className="warn-desc">* 담당자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 출하대기 수 및 사료 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-9001">김축산 총괄소장 (관리자 A)</option>
            <option value="STF-9002">이사료 영양팀장 (관리자 B)</option>
            <option value="STF-9003">박수의 방역수의사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 농장 DB 리셋</button>
      </div>
    </header>
  );
}

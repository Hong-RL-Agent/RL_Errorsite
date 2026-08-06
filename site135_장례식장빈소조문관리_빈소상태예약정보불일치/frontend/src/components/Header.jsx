import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedInUseCount, cachedRecentAltar, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span className="logo-title">MemorialDesk</span>
        <span className="logo-subtitle">장례식장 빈소 예약 · 조문객 키오스크 안내 · 의전 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🕯️ 현재 안치/사용중 빈소:<strong className="stat-value">{cachedInUseCount}개소</strong></div>
          <div className="stat-card">🕊️ 대표 안치 빈소:<strong className="stat-value-alert">{cachedRecentAltar}</strong></div>
        </div>
        <small className="warn-desc">* 장례지도사(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 사용중 빈소 수 및 주요 빈소 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 지도사:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-5001">김장례 총괄지도사 (직원 A)</option>
            <option value="STF-5002">이의전 상담팀장 (직원 B)</option>
            <option value="STF-5003">박안내 안내데스크</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 장례 DB 리셋</button>
      </div>
    </header>
  );
}

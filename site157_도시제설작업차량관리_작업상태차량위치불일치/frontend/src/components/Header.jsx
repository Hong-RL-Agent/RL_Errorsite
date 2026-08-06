import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedDelayedTaskCount, cachedRecentTask, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 12h19M12 2.5v19M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
        </svg>
        <span className="logo-title">SnowFleet</span>
        <span className="logo-subtitle">도시 제설 재난 관제 · 제설차량 GPS 배치 · 염화칼슘 자제 관리</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚨 긴급 대설 긴급 제설 작업건:<strong className="stat-value">{cachedDelayedTaskCount}건</strong></div>
          <div className="stat-card">❄️ 최우선 제설 집중 구역:<strong className="stat-value-alert">{cachedRecentTask}</strong></div>
        </div>
        <small className="warn-desc">* 관리자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 긴급작업 수 및 최근 작업 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관제관:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-9001">김제설 재난총괄관 (관리자 A)</option>
            <option value="STF-9002">이방설 급경사전담 (관리자 B)</option>
            <option value="STF-9003">박차량 장인관제원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 관제센터 DB 리셋</button>
      </div>
    </header>
  );
}

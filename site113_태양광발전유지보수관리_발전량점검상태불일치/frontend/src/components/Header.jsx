import React from 'react';

export default function Header({ activeWorker, handleWorkerSwitch, cachedHotspotCount, cachedRecentJob, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span className="logo-title">SolarOps</span>
        <span className="logo-subtitle">태양광 발전소 발전량 관제 & 패널 유지보수 관리 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🔥 핫스팟 이상 패널:<strong className="stat-value">{cachedHotspotCount}개</strong></div>
          <div className="stat-card">⚡ 최근 점검 작업:<strong className="stat-value-alert">{cachedRecentJob}</strong></div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 패널 목록은 B 권한 기준 변경되나 상단 이상 패널 수 및 최근 점검 상세 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 작업자:</span>
          <select value={activeWorker} onChange={(e) => handleWorkerSwitch(e.target.value)}>
            <option value="WRK-9001">김태양 발전소 관제팀장 (관리자 A)</option>
            <option value="WRK-9002">이패널 유지보수 실장 (관리자 B)</option>
            <option value="WRK-9010">임열화 열화상 점검관 (전문점검원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 발전소 DB 리셋</button>
      </div>
    </header>
  );
}

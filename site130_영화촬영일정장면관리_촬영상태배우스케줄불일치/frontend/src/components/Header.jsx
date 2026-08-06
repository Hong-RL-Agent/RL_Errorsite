import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedUnshotCount, cachedRecentScene, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
        </svg>
        <span className="logo-title">FilmBoard</span>
        <span className="logo-subtitle">영화 제작 촬영 일정 · 장면 스케줄링 · 배우 셋업 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🎬 미촬영 남아있는 장면:<strong className="stat-value">{cachedUnshotCount}건</strong></div>
          <div className="stat-card">📽️ 최고 중요도 씬:<strong className="stat-value-alert">{cachedRecentScene}</strong></div>
        </div>
        <small className="warn-desc">* 제작자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미촬영 장면 수 및 주요 씬 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 제작진:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-8001">김감독 연출감독 (제작자 A)</option>
            <option value="STF-8002">이PD 프로듀서 (제작자 B)</option>
            <option value="STF-8003">박촬영 촬영감독</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 촬영 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingCount, cachedRecentReport, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3l4 8 5-3 5 13H2L8 3z" strokeLinejoin="round" />
        </svg>
        <span className="logo-title">TrailSafe</span>
        <span className="logo-subtitle">국립공원 등산로 위험신고 · 순찰대 긴급출동 · 안전 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">⚠️ 긴급 조치 대기 위험신고:<strong className="stat-value">{cachedPendingCount}건</strong></div>
          <div className="stat-card">⛰️ 대표 긴급 위험 구간:<strong className="stat-value-alert">{cachedRecentReport}</strong></div>
        </div>
        <small className="warn-desc">* 산림 통제관(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미조치 수 및 주요 위험 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 통제관:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-2001">김산림 안전통제관 (담당자 A)</option>
            <option value="STF-2002">이순찰 구조대팀장 (담당자 B)</option>
            <option value="STF-2003">박안전 관제원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 산림 DB 리셋</button>
      </div>
    </header>
  );
}

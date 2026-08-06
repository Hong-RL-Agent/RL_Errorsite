import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedDelayedCount, cachedRecentSchedule, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="6" width="18" height="11" rx="2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M3 11h18" />
        </svg>
        <span className="logo-title">ShuttleCampus</span>
        <span className="logo-subtitle">캠퍼스 셔틀버스 노선 · 락커 스마트 승차인원 · 혼잡도 통합 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚌 지연 운행 중 셔틀버스:<strong className="stat-value">{cachedDelayedCount}대</strong></div>
          <div className="stat-card">🚍 주요 혼잡 셔틀 노선:<strong className="stat-value-alert">{cachedRecentSchedule}</strong></div>
        </div>
        <small className="warn-desc">* 관리자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 지연 운행 수 및 주요 노선 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-8001">김캠퍼스 총괄팀장 (관리자 A)</option>
            <option value="STF-8002">이배차 승차관제원 (관리자 B)</option>
            <option value="STF-8003">박기사 베테랑기사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 셔틀 DB 리셋</button>
      </div>
    </header>
  );
}

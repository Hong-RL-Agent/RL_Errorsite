import React from 'react';

export default function Header({
  activeUser,
  handleUserSwitch,
  cachedDelayedCount,
  cachedRecentDriver,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span className="logo-title">LogiControl</span>
        <span className="logo-subtitle">Integrated Logistics & Driver Control Operations</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🚨 지연 배송 총계:</span>
            <strong className="stat-value">{cachedDelayedCount}건</strong>
          </div>
          <div className="stat-card">
            <span>🚚 최근 배정 담당 기사:</span>
            <strong className="stat-value-alert">{cachedRecentDriver}</strong>
          </div>
        </div>
        <small className="warn-desc">* 계정 스위칭(A ➔ B) 시 목록은 B로 갱신되나 상단 지연 개수 및 최근 기사는 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="user-selector">
          <span>로그인 관리자/직원:</span>
          <select value={activeUser} onChange={(e) => handleUserSwitch(e.target.value)}>
            <option value="ADM-01">김관제 팀장 (관리자 A)</option>
            <option value="ADM-02">이물류 실장 (관리자 B)</option>
            <option value="EMP-01">정배송 사원 (일반 직원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 물류 관제 DB 리셋
        </button>
      </div>
    </header>
  );
}

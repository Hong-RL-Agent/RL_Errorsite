import React from 'react';

export default function Header({
  activeStaff,
  handleStaffSwitch,
  cachedDelayedBaggage,
  cachedRecentPassenger,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.8 19.2 16 11l3.5-3.5C20 7 20 6 19.5 5.5S18 5 17.5 5.5L14 9 5.8 7.2c-.5-.1-1 .1-1.3.5l-.8.8c-.3.4-.2 1 .2 1.3L8 13.5l-3 3-1.8-.6c-.4-.1-.8 0-1.1.3l-.4.4c-.3.3-.3.8 0 1.1l2.5 2.5c.3.3.8.3 1.1 0l.4-.4c.3-.3.4-.7.3-1.1L5.4 17l3-3 3.7 4.1c.3.4.9.5 1.3.2l.8-.8c.4-.3.6-.8.5-1.3z" />
        </svg>
        <span className="logo-title">BagTrace</span>
        <span className="logo-subtitle">Airport Baggage Tracking & Claim Ops</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🧳 지연 수하물 추적 건수:</span>
            <strong className="stat-value">{cachedDelayedBaggage}건</strong>
          </div>
          <div className="stat-card">
            <span>👤 최근 문의 승객 요약:</span>
            <strong className="stat-value-alert">{cachedRecentPassenger}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 수하물 목록은 B 권한으로 바뀌나 상단 지연 수하물 수 및 최근 승객 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STAFF-3001">김수하 수석 (수하물 관제 1팀 - 직원 A)</option>
            <option value="STAFF-3002">이분실 전담 (분실 센터 2팀 - 직원 B)</option>
            <option value="STAFF-3007">조터미널 매니저 (T2 통합 보상팀)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 공항 수하물 DB 리셋
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({
  activeEmp,
  handleEmpSwitch,
  cachedRemainingTickets,
  cachedNextReservation,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
        <span className="logo-title">MealPass</span>
        <span className="logo-subtitle">Cafeteria Menu & Meal Ticket Hub</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🎟️ 보유 잔여 식권:</span>
            <strong className="stat-value">{cachedRemainingTickets}장</strong>
          </div>
          <div className="stat-card">
            <span>🍱 다음 메뉴 예약 요약:</span>
            <strong className="stat-value-alert">{cachedNextReservation}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 식권 목록은 B로 갱신되나 상단 잔여 식권 및 다음 예약 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="emp-selector">
          <span>로그인 사원:</span>
          <select value={activeEmp} onChange={(e) => handleEmpSwitch(e.target.value)}>
            <option value="EMP-01">김철수 팀장 (직원 A)</option>
            <option value="EMP-02">이영희 수석 (직원 B)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 식당 DB 리셋
        </button>
      </div>
    </header>
  );
}

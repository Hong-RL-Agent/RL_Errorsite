import React from 'react';

export default function Header({
  activeUser,
  handleUserSwitch,
  cachedReservationCount,
  cachedUpcomingShowSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
        <span className="logo-title">StageOps</span>
        <span className="logo-subtitle">Theater Seat Reservation & Ticket Operation Portal</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🎟️ 내 보유 티켓 총계:</span>
            <strong className="stat-value">{cachedReservationCount}장</strong>
          </div>
          <div className="stat-card">
            <span>🎭 최근 관람 예정 공연 요약:</span>
            <strong className="stat-value-alert">{cachedUpcomingShowSummary}</strong>
          </div>
        </div>
        <small className="warn-desc">* 사용자 계정(A ➔ B) 전환 시 티켓 목록은 B로 바뀌나 상단 티켓 개수 및 관람 예정 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="user-selector">
          <span>로그인 계정:</span>
          <select value={activeUser} onChange={(e) => handleUserSwitch(e.target.value)}>
            <option value="USR-001">김철수 회원 (사용자 A)</option>
            <option value="USR-002">이영희 회원 (사용자 B)</option>
            <option value="USR-019">안재민 사원 (일반 직원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 예매 관제 DB 리셋
        </button>
      </div>
    </header>
  );
}

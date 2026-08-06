import React from 'react';

export default function Header({
  activeUser,
  handleUserSwitch,
  cachedReservationCount,
  cachedRecentResvSummary,
  cachedOptionsSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-14-7 14" />
          <path d="M12 7v14" />
        </svg>
        <span className="logo-title">CampGround</span>
        <span className="logo-subtitle">Camp Site Booking Platform</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>⛺ 내 예약 건수:</span>
            <strong className="stat-value">{cachedReservationCount}건</strong>
          </div>
          <div className="stat-card">
            <span>📅 최근 예약 요약:</span>
            <strong className="stat-value-alert">{cachedRecentResvSummary}</strong>
          </div>
        </div>
        <small className="warn-desc">* 사용자 계정(A ➔ B) 변경 시 예약 목록은 B로 갱신되나 예약 개수 및 최근 예약/옵션 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="user-selector">
          <span>로그인 회원:</span>
          <select value={activeUser} onChange={(e) => handleUserSwitch(e.target.value)}>
            <option value="USER_A">회원 A (김철수 님)</option>
            <option value="USER_B">회원 B (이영희 님)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 캠핑장 리셋
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({
  activeUser,
  handleUserSwitch,
  cachedOverdueNotice,
  cachedDueDateSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="logo-title">LibrarySeat</span>
        <span className="logo-subtitle">Library Reservation Hub</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🚨 연체 현황 알림:</span>
            <strong className="stat-value-alert">{cachedOverdueNotice}</strong>
          </div>
          <div className="stat-card">
            <span>📅 반납 예정일 요약:</span>
            <strong className="stat-value">{cachedDueDateSummary}</strong>
          </div>
        </div>
        <small className="warn-desc">* 이용자 계정(A ➔ B) 변경 시 대출 목록은 B로 갱신되나 상단 연체 알림과 반납 예정일은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="user-selector">
          <span>로그인 이용자:</span>
          <select value={activeUser} onChange={(e) => handleUserSwitch(e.target.value)}>
            <option value="USER_A">이용자 A (김철수 - 컴퓨터공학)</option>
            <option value="USER_B">이용자 B (이영희 - 경영학과)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 도서관 리셋
        </button>
      </div>
    </header>
  );
}

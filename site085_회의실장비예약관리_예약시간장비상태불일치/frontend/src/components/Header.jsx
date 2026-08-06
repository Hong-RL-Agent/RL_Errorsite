import React from 'react';

export default function Header({
  activeEmp,
  handleEmpSwitch,
  cachedReservationCount,
  cachedNextRoomSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="logo-title">RoomEquip</span>
        <span className="logo-subtitle">Corporate Meeting Room & Shared Equipment Portal</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>📅 내 회의실 예약 건수:</span>
            <strong className="stat-value">{cachedReservationCount}건</strong>
          </div>
          <div className="stat-card">
            <span>🏢 다음 예약 회의실 요약:</span>
            <strong className="stat-value-alert">{cachedNextRoomSummary}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 예약 목록은 B로 갱신되나 상단 건수 및 다음 회의실 요약은 A 캐시가 남음 (Error 6)</small>
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
          🔄 사내 DB 리셋
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({
  activeAdmin,
  handleAdminSwitch,
  cachedRequestCount,
  cachedRecentRoomSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
          <path d="M9 7h6" />
          <path d="M9 11h6" />
          <path d="M9 15h6" />
          <path d="M12 19v2" />
        </svg>
        <span className="logo-title">HotelOps</span>
        <span className="logo-subtitle">Hotel Room & Housekeeping Control System</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🛎️ 미처리 고객 요청 건수:</span>
            <strong className="stat-value-alert">{cachedRequestCount}건</strong>
          </div>
          <div className="stat-card">
            <span>🏨 최근 객실 관제 요약:</span>
            <strong className="stat-value">{cachedRecentRoomSummary}</strong>
          </div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 객실 목록은 B로 바뀌나 고객 요청 개수 및 객실 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 직급:</span>
          <select value={activeAdmin} onChange={(e) => handleAdminSwitch(e.target.value)}>
            <option value="ADM-001">김지배인 (총지배인 - 관리자 A)</option>
            <option value="ADM-002">이하우스 (하우스키핑 매니저 - 관리자 B)</option>
            <option value="ADM-003">박스태프 (일반 사원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 호텔 PMS DB 리셋
        </button>
      </div>
    </header>
  );
}

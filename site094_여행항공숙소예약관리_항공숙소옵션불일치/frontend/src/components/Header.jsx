import React from 'react';

export default function Header({
  activeUser,
  handleUserSwitch,
  cachedDestination,
  cachedCount,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          <path d="M12 2v20M2 12h20" />
        </svg>
        <span className="logo-title">TripBundle</span>
        <span className="logo-subtitle">Flight, Hotel & Travel Package Portal</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🏝️ 최근 탐색 여행지:</span>
            <strong className="stat-value">{cachedDestination}</strong>
          </div>
          <div className="stat-card">
            <span>✈️ 예약 예정 패키지:</span>
            <strong className="stat-value-alert">{cachedCount}건</strong>
          </div>
        </div>
        <small className="warn-desc">* 계정(A ➔ B) 변경 시 내 예약 목록은 B 권한으로 바뀌나 최근 여행지 및 예약 예정 건수는 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 여행자:</span>
          <select value={activeUser} onChange={(e) => handleUserSwitch(e.target.value)}>
            <option value="USR-101">김동남 (VIP - 사용자 A)</option>
            <option value="USR-102">이휴가 (일반 - 사용자 B)</option>
            <option value="USR-103">박바캉스 (VIP 회원)</option>
            <option value="USR-104">최트래블 (일반 회원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 여행 예약 DB 리셋
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({
  activeResident,
  handleResidentSwitch,
  cachedUnpaidAmount,
  cachedRecentBooking,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18M3 7l9-4 9 4v14H3V7zM9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
        </svg>
        <span className="logo-title">AptLife</span>
        <span className="logo-subtitle">Smart Apartment Maintenance & Facility Portal</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>💳 당월 미납 관리비 합계:</span>
            <strong className="stat-value">{cachedUnpaidAmount.toLocaleString()}원</strong>
          </div>
          <div className="stat-card">
            <span>🏢 최근 시설 예약 요약:</span>
            <strong className="stat-value-alert">{cachedRecentBooking}</strong>
          </div>
        </div>
        <small className="warn-desc">* 입주민 계정(A ➔ B) 변경 시 관리비 목록은 B 세대로 바뀌나 상단 미납 금액 및 최근 예약 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 세대:</span>
          <select value={activeResident} onChange={(e) => handleResidentSwitch(e.target.value)}>
            <option value="UNIT-101">101동 101호 (김동남 - 세대 A)</option>
            <option value="UNIT-102">101동 102호 (이휴가 - 세대 B)</option>
            <option value="UNIT-103">101동 201호 (박바캉스)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 단지 데이터베이스 리셋
        </button>
      </div>
    </header>
  );
}

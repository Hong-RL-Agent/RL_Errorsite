import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedTodayCount, cachedRecentBooking, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><circle cx="12" cy="12" r="3" />
        </svg>
        <span className="logo-title">WashBay</span>
        <span className="logo-subtitle">프리미엄 세차장 예약 · 패키지 옵션 관제 · 지체 작업 케어 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚘 당일 입고 예약:<strong className="stat-value">{cachedTodayCount}건</strong></div>
          <div className="stat-card">✨ 최고가 코팅 예약:<strong className="stat-value-alert">{cachedRecentBooking}</strong></div>
        </div>
        <small className="warn-desc">* 담당 직원(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 오늘 예약 수 및 최고가 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 직원:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-9001">김세차 강남점장 (직원 A)</option>
            <option value="STF-9002">이디테일 서초팀장 (직원 B)</option>
            <option value="STF-9003">박광택 광택전문원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 세차 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedInUseCount, cachedRecentBooking, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
        <span className="logo-title">PracticeRoom</span>
        <span className="logo-subtitle">공연 연습실 대관 예약 · QR 도어락 스마트 출입 · 음향장비 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">💃 현재 대관 사용 중 연습실:<strong className="stat-value">{cachedInUseCount}개실</strong></div>
          <div className="stat-card">🎸 주요 대관 팀 출입 현황:<strong className="stat-value-alert">{cachedRecentBooking}</strong></div>
        </div>
        <small className="warn-desc">* 직원(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 사용중 수 및 주요 예약 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 직원:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-5001">김대관 총괄팀장 (직원 A)</option>
            <option value="STF-5002">이출입 관제원 (직원 B)</option>
            <option value="STF-5003">박장비 렌탈담당</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 대관 DB 리셋</button>
      </div>
    </header>
  );
}

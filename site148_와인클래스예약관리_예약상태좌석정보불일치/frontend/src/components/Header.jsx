import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingKitCount, cachedRecentBooking, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 22h8M12 15v7M7 2h10l1 7a6 6 0 0 1-12 0l1-7z" />
        </svg>
        <span className="logo-title">WineClass</span>
        <span className="logo-subtitle">와인 아카데미 클래스 수강 예약 · 좌석 배정 · 테이스팅 키트 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🍷 시음 키트 준비 대기 건수:<strong className="stat-value">{cachedPendingKitCount}건</strong></div>
          <div className="stat-card">🍇 최고 선호 와인 테이스팅반:<strong className="stat-value-alert">{cachedRecentBooking}</strong></div>
        </div>
        <small className="warn-desc">* 직원(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 키트대기 수 및 최근 예약 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 소믈리에:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-9001">김소믈리에 수석팀장 (직원 A)</option>
            <option value="STF-9002">이시음 키트관제원 (직원 B)</option>
            <option value="STF-9003">박와인 어드바이저</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 와인 DB 리셋</button>
      </div>
    </header>
  );
}

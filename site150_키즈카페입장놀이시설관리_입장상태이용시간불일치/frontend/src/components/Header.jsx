import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedOvertimeCount, cachedRecentTicket, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <span className="logo-title">KidsPlay</span>
        <span className="logo-subtitle">프리미엄 키즈카페 입장권 · 기본/연장 이용시간 · 놀이시설 안전 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">⏰ 이용시간 초과 미퇴장 어린이:<strong className="stat-value">{cachedOvertimeCount}명</strong></div>
          <div className="stat-card">🎠 혼잡 놀이시설 최고 인기존:<strong className="stat-value-alert">{cachedRecentTicket}</strong></div>
        </div>
        <small className="warn-desc">* 매장 담당자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 초과 수 및 최근 상세 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-2001">김키즈 총괄매니저 (직원 A)</option>
            <option value="STF-2002">이놀이 안전스태프 (직원 B)</option>
            <option value="STF-2003">박안전 시설점검관</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 키즈카페 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedOvertimeCount, cachedRecentMember, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="logo-title">StudySeat</span>
        <span className="logo-subtitle">스터디카페 좌석권 · 이용시간 연장 · 실시간 좌석 배치 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">⏰ 이용시간 미퇴실 초과 좌석건:<strong className="stat-value">{cachedOvertimeCount}건</strong></div>
          <div className="stat-card">✏️ 최고 회전율 프리미엄 좌석:<strong className="stat-value-alert">{cachedRecentMember}</strong></div>
        </div>
        <small className="warn-desc">* 매니저(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 시간초과 수 및 최근 회원 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 스터디 매니저:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-5501">김좌석 강남본점 매니저 (직원 A)</option>
            <option value="STF-5502">이입실 신촌점 매니저 (직원 B)</option>
            <option value="STF-5503">박연장 홍대점 관제원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 스터디카페 DB 리셋</button>
      </div>
    </header>
  );
}

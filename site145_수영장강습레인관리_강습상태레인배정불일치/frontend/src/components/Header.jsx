import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedAbsenceCount, cachedRecentMember, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2M2 17c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2M2 7c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2" />
        </svg>
        <span className="logo-title">SwimClass</span>
        <span className="logo-subtitle">시립 수영장 강습반 · 레인 배치 · 출석률 통합 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🏊 오늘 무단 미출석 회원:<strong className="stat-value">{cachedAbsenceCount}명</strong></div>
          <div className="stat-card">🌊 상급자 마스터반 배정 회원:<strong className="stat-value-alert">{cachedRecentMember}</strong></div>
        </div>
        <small className="warn-desc">* 직원(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 결석 수 및 주요 회원 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 직원:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-6001">김수영 총괄팀장 (직원 A)</option>
            <option value="STF-6002">이레인 안전관제원 (직원 B)</option>
            <option value="STF-6003">박강사 수석강사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 수영장 DB 리셋</button>
      </div>
    </header>
  );
}

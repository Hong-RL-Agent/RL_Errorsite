import React from 'react';

export default function Header({
  activeStaff,
  handleStaffSwitch,
  cachedCount,
  cachedRecentPatient,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span className="logo-title">ClinicDesk</span>
        <span className="logo-subtitle">Hospital Reception & Payment Control System</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>📋 당일 수납 처리 건수:</span>
            <strong className="stat-value">{cachedCount}건</strong>
          </div>
          <div className="stat-card">
            <span>🏥 최근 조회 환자 상세:</span>
            <strong className="stat-value-alert">{cachedRecentPatient}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 접수 목록은 B 권한으로 바뀌나 상단 처리 건수 및 최근 환자 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 원무직원:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-101">김원무 (수석계장 - 직원 A)</option>
            <option value="STF-102">이수납 (수납과장 - 직원 B)</option>
            <option value="STF-103">박접수 (접수주임)</option>
            <option value="STF-104">최원무 (일반 사원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 원무 EMR DB 리셋
        </button>
      </div>
    </header>
  );
}

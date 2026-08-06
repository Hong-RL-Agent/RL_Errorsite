import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedUnassignedCount, cachedRecentSchedule, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="logo-title">CampaignCrew</span>
        <span className="logo-subtitle">선거 캠프 일정 · 유세 관제 · 자원봉사자 배정 통합 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚩 미배정 일정:<strong className="stat-value">{cachedUnassignedCount}건</strong></div>
          <div className="stat-card">🙋 최근 배정 리더:<strong className="stat-value-alert">{cachedRecentSchedule}</strong></div>
        </div>
        <small className="warn-desc">* 운영자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미배정 일정 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 운영자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-4001">김캠프 총괄본부장 (운영자 A)</option>
            <option value="STF-4002">이봉사 조직위원장 (운영자 B)</option>
            <option value="STF-4003">박유세 현장팀장</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 캠프 DB 리셋</button>
      </div>
    </header>
  );
}

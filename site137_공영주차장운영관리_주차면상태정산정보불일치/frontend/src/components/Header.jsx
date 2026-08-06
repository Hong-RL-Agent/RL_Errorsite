import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedUnpaidCount, cachedRecentRecord, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
        </svg>
        <span className="logo-title">ParkControl</span>
        <span className="logo-subtitle">공영주차장 주차면 유도 · LPR 입출차 · 무인 정산 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚨 장기 체납 미납 차량:<strong className="stat-value">{cachedUnpaidCount}건</strong></div>
          <div className="stat-card">🚘 대표 입차 차량:<strong className="stat-value-alert">{cachedRecentRecord}</strong></div>
        </div>
        <small className="warn-desc">* 관제 관리자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미납 수 및 주요 입차 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-7001">김주차 관제팀장 (관리자 A)</option>
            <option value="STF-7002">이정산 수석원 (관리자 B)</option>
            <option value="STF-7003">박입출 LPR관제원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 주차 DB 리셋</button>
      </div>
    </header>
  );
}

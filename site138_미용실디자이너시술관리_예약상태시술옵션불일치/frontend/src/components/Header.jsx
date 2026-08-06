import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedTodayCount, cachedRecentClient, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
        </svg>
        <span className="logo-title">HairStudioPro</span>
        <span className="logo-subtitle">프리미엄 헤어 살롱 예약 · 디자이너 스케줄 · 시술 옵션 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">✂️ 오늘 시술 예약 건수:<strong className="stat-value">{cachedTodayCount}건</strong></div>
          <div className="stat-card">💇‍♀️ 대표 VVIP 방문 고객:<strong className="stat-value-alert">{cachedRecentClient}</strong></div>
        </div>
        <small className="warn-desc">* 디자이너(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 오늘 예약 수 및 주요 고객 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 디자이너:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-8001">엘리 수석원장 (직원 A)</option>
            <option value="STF-8002">지아 수석디자이너 (직원 B)</option>
            <option value="STF-8003">민우 디자이너</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 살롱 DB 리셋</button>
      </div>
    </header>
  );
}

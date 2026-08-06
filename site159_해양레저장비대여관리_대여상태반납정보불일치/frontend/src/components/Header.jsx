import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedDelayedReturnCount, cachedRecentRental, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20M2 12a10 10 0 0 1 10-10 10 10 0 0 1 10 10M2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10" />
        </svg>
        <span className="logo-title">MarineRent</span>
        <span className="logo-subtitle">해양 레저 장비 대여 · 안전 교육 · 반납 점검 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">⚓ 장비 반납 시각 연체/지연건:<strong className="stat-value">{cachedDelayedReturnCount}건</strong></div>
          <div className="stat-card">🏄 최고 가동률 프리미엄 장비:<strong className="stat-value-alert">{cachedRecentRental}</strong></div>
        </div>
        <small className="warn-desc">* 지점장(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 반납지연 수 및 최근 대여 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 마리나 지점장:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-9901">김해양 해운대 지점장 (직원 A)</option>
            <option value="STF-9902">이서핑 서귀포 지점장 (직원 B)</option>
            <option value="STF-9903">박안전 경포 수석교관</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 마리나 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedInTreatmentCount, cachedRecentAnimal, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6v6l4 2" />
        </svg>
        <span className="logo-title">ZooCare</span>
        <span className="logo-subtitle">동물원 사육 관제 · 수의 진료 · 사육 구역 통합 관리 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🦁 진료 및 집중 치료 대기 동물:<strong className="stat-value">{cachedInTreatmentCount}마리</strong></div>
          <div className="stat-card">🏥 집중 수의 치료 대상:<strong className="stat-value-alert">{cachedRecentAnimal}</strong></div>
        </div>
        <small className="warn-desc">* 사육사(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 치료대기 수 및 최근 동물 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 사육사:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-9501">김사육 수석사육사 (직원 A)</option>
            <option value="STF-9502">이동물 수의관 (직원 B)</option>
            <option value="STF-9503">박진료 수의사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 동물원 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeWorker, handleWorkerSwitch, cachedPendingHazards, cachedRecentInspection, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="logo-title">BuildSafe</span>
        <span className="logo-subtitle">건설현장 안전점검 · 장비 배정 · 작업자 교육 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚨 미조치 위험요소:<strong className="stat-value">{cachedPendingHazards}건</strong></div>
          <div className="stat-card">🏗️ 최근 안전점검:<strong className="stat-value-alert">{cachedRecentInspection}</strong></div>
        </div>
        <small className="warn-desc">* 안전관리자 A ➔ B 변경 시 점검 목록은 B 담당 기준 변경되나 상단 미조치 위험요소 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeWorker} onChange={(e) => handleWorkerSwitch(e.target.value)}>
            <option value="WRK-A001">김안전 총괄책임자 (관리자 A)</option>
            <option value="WRK-A002">이현장 안전감독관 (관리자 B)</option>
            <option value="WRK-A009">장추락 추락방지 반장</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 건설 현장 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeResearcher, handleResearcherSwitch, cachedMyReservations, cachedRecentExpLog, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3v2m6-2v2M9 19h6M5 7h14M6 7l3 12h6l3-12" />
        </svg>
        <span className="logo-title">LabReserve</span>
        <span className="logo-subtitle">연구실 장비 예약 · 실험 로그 · 장비 점검 통합 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🧪 내 장비 예약:<strong className="stat-value">{cachedMyReservations}건</strong></div>
          <div className="stat-card">🔬 최근 실험 로그:<strong className="stat-value-alert">{cachedRecentExpLog}</strong></div>
        </div>
        <small className="warn-desc">* 연구원 A ➔ B 변경 시 예약 목록은 B 담당 기준 변경되나 상단 내 예약 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 연구원:</span>
          <select value={activeResearcher} onChange={(e) => handleResearcherSwitch(e.target.value)}>
            <option value="RES-2001">김연구 책임연구원 (연구원 A)</option>
            <option value="RES-2002">이실험 선임연구원 (연구원 B)</option>
            <option value="RES-2006">강나노 전자현미경 연구원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 연구실 DB 리셋</button>
      </div>
    </header>
  );
}

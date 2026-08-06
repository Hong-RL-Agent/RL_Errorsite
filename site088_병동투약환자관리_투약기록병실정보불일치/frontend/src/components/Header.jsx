import React from 'react';

export default function Header({
  activeNurse,
  handleNurseSwitch,
  cachedScheduledCount,
  cachedRecentPatientSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <span className="logo-title">WardMate</span>
        <span className="logo-subtitle">Ward Inpatient Medication & Room Allocation System</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>💊 담당 투약 예정 총계:</span>
            <strong className="stat-value">{cachedScheduledCount}건</strong>
          </div>
          <div className="stat-card">
            <span>🏥 최근 관찰 환자 요약:</span>
            <strong className="stat-value-alert">{cachedRecentPatientSummary}</strong>
          </div>
        </div>
        <small className="warn-desc">* 간호사 계정(A ➔ B) 변경 시 환자 목록은 B로 갱신되나 상단 예정 건수 및 최근 환자 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="nurse-selector">
          <span>로그인 간호사:</span>
          <select value={activeNurse} onChange={(e) => handleNurseSwitch(e.target.value)}>
            <option value="NRS-001">김간호 수간호사 (관리자 A)</option>
            <option value="NRS-002">이간호 주임 (일반 간호사)</option>
            <option value="NRS-003">박간호 선임 (관리자 B)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 EMR 병동 DB 리셋
        </button>
      </div>
    </header>
  );
}

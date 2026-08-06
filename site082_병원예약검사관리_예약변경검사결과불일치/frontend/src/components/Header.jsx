import React from 'react';

export default function Header({
  activePatient,
  handlePatientSwitch,
  cachedLatestTestResult,
  cachedUnreadNoticeCount,
  cachedPrescriptionSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span className="logo-title">MediCheck</span>
        <span className="logo-subtitle">Hospital Patient Care Portal</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🔬 최근 검사 결과:</span>
            <strong className="stat-value">{cachedLatestTestResult}</strong>
          </div>
          <div className="stat-card">
            <span>🔔 미확인 알림:</span>
            <strong className="stat-value-alert">{cachedUnreadNoticeCount}건</strong>
          </div>
        </div>
        <small className="warn-desc">* 환자 계정(A ➔ B) 변경 시 예약 목록은 B로 갱신되나 최근 검사 수치, 미확인 알림 및 처방전 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="patient-selector">
          <span>로그인 환자:</span>
          <select value={activePatient} onChange={(e) => handlePatientSwitch(e.target.value)}>
            <option value="PAT-01">환자 A (김철수 님 - 45세 남)</option>
            <option value="PAT-02">환자 B (이영희 님 - 52세 여)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 병원 DB 리셋
        </button>
      </div>
    </header>
  );
}

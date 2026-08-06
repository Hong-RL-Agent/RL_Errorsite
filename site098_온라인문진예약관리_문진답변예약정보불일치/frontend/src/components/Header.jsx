import React from 'react';

export default function Header({
  activeAdmin,
  handleAdminSwitch,
  cachedIncompleteSurvey,
  cachedRecentAppointment,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="logo-title">MediSurvey</span>
        <span className="logo-subtitle">Medical Pre-Exam & Smart Appointment System</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>📝 진행 중 문진:</span>
            <strong className="stat-value">{cachedIncompleteSurvey}건</strong>
          </div>
          <div className="stat-card">
            <span>📅 최근 예약 요약:</span>
            <strong className="stat-value-alert">{cachedRecentAppointment}</strong>
          </div>
        </div>
        <small className="warn-desc">* 환자 계정(A ➔ B) 변경 시 문진 목록은 B 권한으로 바뀌나 상단 진행 중 문진 및 최근 예약 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관계자:</span>
          <select value={activeAdmin} onChange={(e) => handleAdminSwitch(e.target.value)}>
            <option value="ADM-101">김문진 과장 (원무 총괄 - 환자 A)</option>
            <option value="ADM-102">이진료 전문의 (스마트센터 - 환자 B)</option>
            <option value="ADM-103">박예약 조교 (일반 사원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 병원 EMR DB 리셋
        </button>
      </div>
    </header>
  );
}

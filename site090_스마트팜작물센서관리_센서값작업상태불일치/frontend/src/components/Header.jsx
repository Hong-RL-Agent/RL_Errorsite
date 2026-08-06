import React from 'react';

export default function Header({
  activeAdmin,
  handleAdminSwitch,
  cachedAlertCount,
  cachedRecentSensorSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span className="logo-title">FarmSense</span>
        <span className="logo-subtitle">Smart Farm Crop & Sensor Control Dashboard</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🚨 위험 이상 알림 총계:</span>
            <strong className="stat-value">{cachedAlertCount}건</strong>
          </div>
          <div className="stat-card">
            <span>🌱 최근 선택 구역 센서 요약:</span>
            <strong className="stat-value-alert">{cachedRecentSensorSummary}</strong>
          </div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 구역 목록은 B로 바뀌나 상단 위험 알림 개수 및 센서 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeAdmin} onChange={(e) => handleAdminSwitch(e.target.value)}>
            <option value="ADM-301">김농장 대표 (관리자 A)</option>
            <option value="ADM-302">이재배 과장 (관리자 B)</option>
            <option value="ADM-303">박센서 팀장 (일반 직원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 스마트팜 DB 리셋
        </button>
      </div>
    </header>
  );
}

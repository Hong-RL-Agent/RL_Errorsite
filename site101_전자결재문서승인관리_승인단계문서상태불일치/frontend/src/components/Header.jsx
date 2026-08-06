import React from 'react';

export default function Header({
  activeEmployee,
  handleEmployeeSwitch,
  cachedPendingCount,
  cachedRecentDoc,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="logo-title">SignFlow</span>
        <span className="logo-subtitle">Groupware Electronic Approval Console</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>📑 결재 대기 문서:</span>
            <strong className="stat-value">{cachedPendingCount}건</strong>
          </div>
          <div className="stat-card">
            <span>📌 최근 결재선 요약:</span>
            <strong className="stat-value-alert">{cachedRecentDoc}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 문서 목록은 B 결재권으로 바뀌나 상단 대기 건수 및 결재선 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 결재권자:</span>
          <select value={activeEmployee} onChange={(e) => handleEmployeeSwitch(e.target.value)}>
            <option value="EMP-2001">김동남 대리 (기안자 - 직원 A)</option>
            <option value="EMP-2003">박바캉스 부장 (최종 승인권자 - 직원 B)</option>
            <option value="EMP-2004">최트래블 차장 (IT 결재권자)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 전자결재 DB 리셋
        </button>
      </div>
    </header>
  );
}

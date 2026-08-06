import React from 'react';

export default function Header({
  activeAdmin,
  handleAdminSwitch,
  cachedMyIssueCount,
  cachedRecentIssue,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="logo-title">TaskFlow</span>
        <span className="logo-subtitle">Agile Project & Issue Tracking Workspace</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>📌 내 배정 이슈:</span>
            <strong className="stat-value">{cachedMyIssueCount}건</strong>
          </div>
          <div className="stat-card">
            <span>⚡ 최근 작업 이슈:</span>
            <strong className="stat-value-alert">{cachedRecentIssue}</strong>
          </div>
        </div>
        <small className="warn-desc">* 사용자 계정(A ➔ B) 변경 시 이슈 목록은 B 권한으로 바뀌나 상단 내 이슈 수 및 최근 이슈 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 작업자:</span>
          <select value={activeAdmin} onChange={(e) => handleAdminSwitch(e.target.value)}>
            <option value="ADM-101">김프로젝트 (PM 총괄 - 사용자 A)</option>
            <option value="ADM-102">이아키텍트 (수석 - 사용자 B)</option>
            <option value="ADM-103">박스프린트 (일반 팀원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 TaskFlow DB 리셋
        </button>
      </div>
    </header>
  );
}

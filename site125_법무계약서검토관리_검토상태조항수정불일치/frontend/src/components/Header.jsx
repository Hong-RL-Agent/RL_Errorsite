import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingReviewCount, cachedRecentContract, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="logo-title">LegalFlow</span>
        <span className="logo-subtitle">기업 법무 계약서 검토 · 조항 리스크 심사 · 최종 승인 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📜 법무 검토대기 계약:<strong className="stat-value">{cachedPendingReviewCount}건</strong></div>
          <div className="stat-card">⚠️ 최고 리스크 계약:<strong className="stat-value-alert">{cachedRecentContract}</strong></div>
        </div>
        <small className="warn-desc">* 담당자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 검토대기 수 및 리스크 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 법무담당:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-3001">김법무 수석변호사 (담당자 A)</option>
            <option value="STF-3002">이계약 검토팀장 (담당자 B)</option>
            <option value="STF-3003">박리스크 준법원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 법무 DB 리셋</button>
      </div>
    </header>
  );
}

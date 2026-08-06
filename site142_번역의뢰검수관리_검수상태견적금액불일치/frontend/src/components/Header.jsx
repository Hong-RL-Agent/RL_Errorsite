import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedReviewingCount, cachedRecentRequest, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 8l6 6M4 14l6-6 2 2M2 5h12M9 2v3" /><path d="M22 22l-5-10-5 10M14 18h6" />
        </svg>
        <span className="logo-title">TransDesk</span>
        <span className="logo-subtitle">글로벌 전문 번역 의뢰 · 품질 감수 · 견적 및 납품 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📝 검수 대기 번역 프로젝트:<strong className="stat-value">{cachedReviewingCount}건</strong></div>
          <div className="stat-card">🌐 주요 초안 검토 의뢰:<strong className="stat-value-alert">{cachedRecentRequest}</strong></div>
        </div>
        <small className="warn-desc">* 번역 매니저(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 검수대기 수 및 주요 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 매니저:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-3001">김번역 PM 팀장 (매니저 A)</option>
            <option value="STF-3002">이검수 감수관 (매니저 B)</option>
            <option value="STF-3003">박정산 견적관</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 번역 DB 리셋</button>
      </div>
    </header>
  );
}

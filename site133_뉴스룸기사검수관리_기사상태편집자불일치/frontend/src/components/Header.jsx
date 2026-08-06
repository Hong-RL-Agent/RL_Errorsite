import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedReviewingCount, cachedRecentArticle, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l5 5v9a2 2 0 0 1-2 2z" /><polyline points="14 4 14 9 19 9" /><line x1="7" y1="13" x2="17" y2="13" /><line x1="7" y1="17" x2="13" y2="17" />
        </svg>
        <span className="logo-title">NewsDesk</span>
        <span className="logo-subtitle">통합 뉴스룸 기사 CMS · 데스크 검수 · 실시간 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📰 데스크 검수 대기 기사:<strong className="stat-value">{cachedReviewingCount}건</strong></div>
          <div className="stat-card">🔥 최고 조회수 단독 기사:<strong className="stat-value-alert">{cachedRecentArticle}</strong></div>
        </div>
        <small className="warn-desc">* 편집자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 검수대기 수 및 주요 기사 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 에디터:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-3001">김편집 수석편집자 (편집자 A)</option>
            <option value="STF-3002">이데스크 IT에디터 (편집자 B)</option>
            <option value="STF-3003">박기자 정치기자</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 뉴스 DB 리셋</button>
      </div>
    </header>
  );
}

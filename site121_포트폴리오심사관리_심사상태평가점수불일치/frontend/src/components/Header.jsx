import React from 'react';

export default function Header({ activeReviewer, handleReviewerSwitch, cachedPendingCount, cachedRecentApplicant, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="logo-title">CareerReview</span>
        <span className="logo-subtitle">지원자 포트폴리오 제출 · 심사 평가 · 채용 점수 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📑 미심사 대기 지원자:<strong className="stat-value">{cachedPendingCount}명</strong></div>
          <div className="stat-card">🏅 최근 평가 최고점:<strong className="stat-value-alert">{cachedRecentApplicant}</strong></div>
        </div>
        <small className="warn-desc">* 심사위원 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미심사 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 심사위원:</span>
          <select value={activeReviewer} onChange={(e) => handleReviewerSwitch(e.target.value)}>
            <option value="REV-6001">김디자인 총괄리드 (심사위원 A)</option>
            <option value="REV-6002">이개발 테크리드 (심사위원 B)</option>
            <option value="REV-6003">박기획 파트장</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 심사 DB 리셋</button>
      </div>
    </header>
  );
}

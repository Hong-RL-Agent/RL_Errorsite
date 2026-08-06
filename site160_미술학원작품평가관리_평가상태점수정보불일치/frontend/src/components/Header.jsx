import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingEvalCount, cachedRecentArt, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M4.93 19.07l4.24-4.24" />
        </svg>
        <span className="logo-title">ArtReview</span>
        <span className="logo-subtitle">미술 학원 작품 제출 · 강사 수의 채점 · 피드백 통합 관리 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🎨 실기 평가 및 미채점 작품건:<strong className="stat-value">{cachedPendingEvalCount}건</strong></div>
          <div className="stat-card">🖌️ 최우선 최고점 실기 작품:<strong className="stat-value-alert">{cachedRecentArt}</strong></div>
        </div>
        <small className="warn-desc">* 강사(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 평가대기 수 및 최근 작품 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당 강사:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-8801">김화실 수시전임 (강사 A)</option>
            <option value="STF-8802">이소묘 예고소묘 (강사 B)</option>
            <option value="STF-8803">박수채 수석교사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 미술학원 DB 리셋</button>
      </div>
    </header>
  );
}

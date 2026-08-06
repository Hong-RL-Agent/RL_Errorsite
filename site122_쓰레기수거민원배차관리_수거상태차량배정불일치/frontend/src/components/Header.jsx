import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingComplaintCount, cachedRecentSchedule, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
        </svg>
        <span className="logo-title">CleanRoute</span>
        <span className="logo-subtitle">도시 생활폐기물 수거 일정 · 청소 차량 배차 · 민원 처리 통합 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚨 미처리 환경 민원:<strong className="stat-value-alert">{cachedPendingComplaintCount}건</strong></div>
          <div className="stat-card">🚛 최근 기동 배차:<strong className="stat-value">{cachedRecentSchedule}</strong></div>
        </div>
        <small className="warn-desc">* 담당 직원(A ➔ B) 변경 시 목록은 B 담당 기준 변경되나 상단 미처리 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-7001">김청소 자원순환과장 (직원 A)</option>
            <option value="STF-7002">이배차 기동팀장 (직원 B)</option>
            <option value="STF-7003">박민원 콜센터원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 청정 DB 리셋</button>
      </div>
    </header>
  );
}

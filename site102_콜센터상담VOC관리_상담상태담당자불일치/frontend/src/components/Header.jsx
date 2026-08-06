import React from 'react';

export default function Header({
  activeAgent,
  handleAgentSwitch,
  cachedUnprocessedCalls,
  cachedRecentCustomer,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          <path d="M14 2v4M18 2v8M22 2v12" />
        </svg>
        <span className="logo-title">CallDesk</span>
        <span className="logo-subtitle">Call Center VOC & Agent Assignment System</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>📞 미처리 상담 대기:</span>
            <strong className="stat-value">{cachedUnprocessedCalls}건</strong>
          </div>
          <div className="stat-card">
            <span>👤 최근 문의 고객 요약:</span>
            <strong className="stat-value-alert">{cachedRecentCustomer}</strong>
          </div>
        </div>
        <small className="warn-desc">* 상담원 계정(A ➔ B) 변경 시 상담 목록은 B 담당으로 바뀌나 상단 미처리 대기 수 및 최근 고객 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 상담원:</span>
          <select value={activeAgent} onChange={(e) => handleAgentSwitch(e.target.value)}>
            <option value="AGT-3001">김상담 수석 (VOC 1팀 - 상담원 A)</option>
            <option value="AGT-3002">이응대 전담 (VOC 1팀 - 상담원 B)</option>
            <option value="AGT-3003">박친절 상담원 (물류 전담팀)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 콜센터 CRM DB 리셋
        </button>
      </div>
    </header>
  );
}

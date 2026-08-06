import React from 'react';

export default function Header({
  activeAdjuster,
  handleAdjusterSwitch,
  cachedPendingAudits,
  cachedRecentClaim,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span className="logo-title">ClaimGuard</span>
        <span className="logo-subtitle">Insurance Claim Audit & Payout Console</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>📋 미처리 심사 대기:</span>
            <strong className="stat-value">{cachedPendingAudits}건</strong>
          </div>
          <div className="stat-card">
            <span>💰 최근 청구 결제 요약:</span>
            <strong className="stat-value-alert">{cachedRecentClaim}</strong>
          </div>
        </div>
        <small className="warn-desc">* 심사자 계정(A ➔ B) 변경 시 청구 목록은 B 담당으로 바뀌나 상단 심사 대기 건수 및 최근 청구 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 심사자:</span>
          <select value={activeAdjuster} onChange={(e) => handleAdjusterSwitch(e.target.value)}>
            <option value="AUD-101">김심사 수석 (장기보상 1팀 - 심사자 A)</option>
            <option value="AUD-102">이검토 선임 (장기보상 2팀 - 심사자 B)</option>
            <option value="AUD-103">박서류 사정원 (실손보상팀)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 손해사정 DB 리셋
        </button>
      </div>
    </header>
  );
}

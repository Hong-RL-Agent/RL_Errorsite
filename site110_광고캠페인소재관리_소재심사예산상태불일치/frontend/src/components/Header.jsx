import React from 'react';

export default function Header({
  activeStaff,
  handleStaffSwitch,
  cachedPendingAudits,
  cachedRecentCampaign,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="logo-title">AdPilot</span>
        <span className="logo-subtitle">Digital Ad Campaign & Creative Audit Console</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🎯 심사 대기 광고 소재:</span>
            <strong className="stat-value">{cachedPendingAudits}건</strong>
          </div>
          <div className="stat-card">
            <span>📊 최근 캠페인 요약:</span>
            <strong className="stat-value-alert">{cachedRecentCampaign}</strong>
          </div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 캠페인 목록은 B 권한으로 바뀌나 상단 심사 대기 건수 및 최근 캠페인 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 마케터:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STAFF-6001">김광고 총괄 (마케팅 1팀 - 관리자 A)</option>
            <option value="STAFF-6002">이심사 관 (소재 심사센터 - 관리자 B)</option>
            <option value="STAFF-6007">조광고주 매니저 (VIP 어카운트)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 애드 서버 DB 리셋
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedWinPendingCount, cachedRecentAuction, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" /><path d="M12 6v12" /><path d="M6 12h12" />
        </svg>
        <span className="logo-title">FishAuction</span>
        <span className="logo-subtitle">수산물 경매 입찰 · 중도매인 낙찰 · 콜드체인 출하 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🐟 낙찰 대기 경매:<strong className="stat-value">{cachedWinPendingCount}건</strong></div>
          <div className="stat-card">⚓ 최근 최고가 낙찰:<strong className="stat-value-alert">{cachedRecentAuction}</strong></div>
        </div>
        <small className="warn-desc">* 담당자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 낙찰대기 수 및 최고가 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-4001">김경매 경매사 (관리자 A)</option>
            <option value="STF-4002">이정산 정산과장 (관리자 B)</option>
            <option value="STF-4003">박검수 품질검수원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 경매 DB 리셋</button>
      </div>
    </header>
  );
}

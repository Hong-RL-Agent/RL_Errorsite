import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingDeliveryCount, cachedRecentAuction, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" /><circle cx="12" cy="9" r="2.5" />
        </svg>
        <span className="logo-title">FlowerBid</span>
        <span className="logo-subtitle">양재/창동 화훼 경매 · 낙찰 수량 · 콜드체인 배송 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🌸 출고 배송 대기 낙찰건:<strong className="stat-value">{cachedPendingDeliveryCount}건</strong></div>
          <div className="stat-card">🏆 최고가 낙찰 화훼 품목:<strong className="stat-value-alert">{cachedRecentAuction}</strong></div>
        </div>
        <small className="warn-desc">* 담당 직원(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 배송대기 수 및 최고가 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 경매사:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-4001">김경매 수석경매사 (직원 A)</option>
            <option value="STF-4002">이배송 물류팀장 (직원 B)</option>
            <option value="STF-4003">박검수 검수원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 화훼 DB 리셋</button>
      </div>
    </header>
  );
}

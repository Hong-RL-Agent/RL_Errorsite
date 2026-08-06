import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedDelayedPreparationCount, cachedRecentOrder, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="8" width="18" height="13" rx="2" /><path d="M16 8V6a4 4 0 0 0-8 0v2" />
        </svg>
        <span className="logo-title">DutyPickup</span>
        <span className="logo-subtitle">공항 면세품 인도장 · 픽업 지점 · 상품 수량 통합 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">✈️ 출국시각 임박 인도 준비지연건:<strong className="stat-value">{cachedDelayedPreparationCount}건</strong></div>
          <div className="stat-card">🛍️ 최우선 인도 인도장 픽업건:<strong className="stat-value-alert">{cachedRecentOrder}</strong></div>
        </div>
        <small className="warn-desc">* 인도장 관제장(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 준비지연 수 및 최근 주문 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 인도장 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-6601">김픽업 T1 관제총괄 (직원 A)</option>
            <option value="STF-6602">이인도 T2 관제총괄 (직원 B)</option>
            <option value="STF-6603">박검수 보관물류원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 면세 인도장 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({
  activeAdmin,
  handleAdminSwitch,
  cachedCouponCount,
  cachedRecentCustomer,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="logo-title">MemberPlus</span>
        <span className="logo-subtitle">Customer Membership & Coupon Loyalty Console</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🎫 금일 발급 쿠폰:</span>
            <strong className="stat-value">{cachedCouponCount}장</strong>
          </div>
          <div className="stat-card">
            <span>👤 최근 관리 고객:</span>
            <strong className="stat-value-alert">{cachedRecentCustomer}</strong>
          </div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 전환 시 고객 목록은 B 권한으로 바뀌나 상단 쿠폰 수 및 최근 고객 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 운영자:</span>
          <select value={activeAdmin} onChange={(e) => handleAdminSwitch(e.target.value)}>
            <option value="ADM-101">김멤버십 (CRM 팀장 - 관리자 A)</option>
            <option value="ADM-102">이쿠폰 (과장 - 관리자 B)</option>
            <option value="ADM-103">박CRM (일반 사원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 CRM DB 리셋
        </button>
      </div>
    </header>
  );
}

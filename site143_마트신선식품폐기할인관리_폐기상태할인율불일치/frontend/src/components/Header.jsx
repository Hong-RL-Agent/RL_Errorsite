import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedDisposalPendingCount, cachedRecentProduct, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6v6l4 2" />
        </svg>
        <span className="logo-title">FreshMark</span>
        <span className="logo-subtitle">대형마트 신선식품 유통기한 관제 · 타임세일 할인 · 폐기 관리 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🥩 폐기 임박 미판매 상품:<strong className="stat-value">{cachedDisposalPendingCount}건</strong></div>
          <div className="stat-card">🐟 최고할인 적용 대표 품목:<strong className="stat-value-alert">{cachedRecentProduct}</strong></div>
        </div>
        <small className="warn-desc">* 매장 담당자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 폐기예정 수 및 주요 품목 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-4001">김신선 총괄팀장 (직원 A)</option>
            <option value="STF-4002">이할인 점검원 (직원 B)</option>
            <option value="STF-4003">박폐기 관리원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 신선식품 DB 리셋</button>
      </div>
    </header>
  );
}

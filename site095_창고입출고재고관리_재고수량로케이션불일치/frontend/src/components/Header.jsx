import React from 'react';

export default function Header({
  activeStaff,
  handleStaffSwitch,
  cachedLowStockCount,
  cachedRecentProduct,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        <span className="logo-title">StockYard</span>
        <span className="logo-subtitle">Warehouse & Location Management System</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🚨 안전재고 미달 품목:</span>
            <strong className="stat-value-alert">{cachedLowStockCount}개 품목</strong>
          </div>
          <div className="stat-card">
            <span>📦 최근 실사 작업 상품:</span>
            <strong className="stat-value">{cachedRecentProduct}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 상품 목록은 B 권한으로 바뀌나 상단 미달 품목 및 최근 상품 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 작업자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-101">김창고 (총괄반장 - 직원 A)</option>
            <option value="STF-102">이재고 (수석 - 직원 B)</option>
            <option value="STF-103">박입고 (입고주임)</option>
            <option value="STF-104">최출고 (출고사원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 창고 WMS DB 리셋
        </button>
      </div>
    </header>
  );
}

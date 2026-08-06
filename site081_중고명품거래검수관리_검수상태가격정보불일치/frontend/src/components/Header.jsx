import React from 'react';

export default function Header({
  activeSeller,
  handleSellerSwitch,
  cachedSalesAmount,
  cachedInspectionNotice,
  cachedRecentTrxSummary,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="logo-title">LuxeCheck</span>
        <span className="logo-subtitle">Luxury Inspection Platform</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>💎 판매 예정 총액:</span>
            <strong className="stat-value">{cachedSalesAmount}</strong>
          </div>
          <div className="stat-card">
            <span>⏳ 검수 대기 알림:</span>
            <strong className="stat-value-alert">{cachedInspectionNotice}</strong>
          </div>
        </div>
        <small className="warn-desc">* 판매자 계정(A ➔ B) 변경 시 상품 목록은 B로 갱신되나 판매 예정 금액과 검수 대기 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="seller-selector">
          <span>로그인 셀러:</span>
          <select value={activeSeller} onChange={(e) => handleSellerSwitch(e.target.value)}>
            <option value="SLR-01">셀러 A (김명품 - VIP 셀러)</option>
            <option value="SLR-02">셀러 B (이럭셔리 - 우수 셀러)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 검수소 리셋
        </button>
      </div>
    </header>
  );
}

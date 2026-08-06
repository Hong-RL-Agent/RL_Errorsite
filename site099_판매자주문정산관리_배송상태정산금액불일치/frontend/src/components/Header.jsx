import React from 'react';

export default function Header({
  activeSeller,
  handleSellerSwitch,
  cachedTodayOrders,
  cachedSettlementAmount,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span className="logo-title">SellerDesk</span>
        <span className="logo-subtitle">E-Commerce Seller Center & Settlement Console</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🛍️ 오늘 신규 주문:</span>
            <strong className="stat-value">{cachedTodayOrders}건</strong>
          </div>
          <div className="stat-card">
            <span>💰 정산 예정 금액:</span>
            <strong className="stat-value-alert">₩{cachedSettlementAmount.toLocaleString()}원</strong>
          </div>
        </div>
        <small className="warn-desc">* 판매자 계정(A ➔ B) 변경 시 주문 목록은 B 스토어 기준으로 바뀌나 상단 주문 수 및 정산 금액은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 판매자:</span>
          <select value={activeSeller} onChange={(e) => handleSellerSwitch(e.target.value)}>
            <option value="SLR-101">스마트디지털 (파워스토어 - 판매자 A)</option>
            <option value="SLR-102">홈리빙 갤러리 (빅파워 - 판매자 B)</option>
            <option value="SLR-103">트렌디 패션 (일반스토어)</option>
            <option value="SLR-104">프리미엄 뷰티 (파워스토어)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 판매자 센터 DB 리셋
        </button>
      </div>
    </header>
  );
}

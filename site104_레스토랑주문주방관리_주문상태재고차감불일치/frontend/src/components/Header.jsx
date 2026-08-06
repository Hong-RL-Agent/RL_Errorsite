import React from 'react';

export default function Header({
  activeChef,
  handleChefSwitch,
  cachedUnprocessedOrders,
  cachedRecentOrder,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span className="logo-title">KitchenOps</span>
        <span className="logo-subtitle">Restaurant Kitchen & Inventory Ops</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🍳 주방 대기 주문:</span>
            <strong className="stat-value">{cachedUnprocessedOrders}건</strong>
          </div>
          <div className="stat-card">
            <span>🍽️ 최근 알림 주문:</span>
            <strong className="stat-value-alert">{cachedRecentOrder}</strong>
          </div>
        </div>
        <small className="warn-desc">* 주방 직원 계정(A ➔ B) 변경 시 주문 목록은 B 담당으로 바뀌나 상단 미처리 대기 수 및 최근 주문 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 셰프:</span>
          <select value={activeChef} onChange={(e) => handleChefSwitch(e.target.value)}>
            <option value="CHEF-3001">김주방 헤드 (스테이크 전담 - 직원 A)</option>
            <option value="CHEF-3002">이파스타 수셰프 (파스타 전담 - 직원 B)</option>
            <option value="CHEF-3007">조피자 셰프 (화덕 피자 파트)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 POS & 주방 DB 리셋
        </button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedDelayedCount, cachedRecentOrder, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="logo-title">CraftOrder</span>
        <span className="logo-subtitle">수제 공방 주문 제작 · 커스텀 각인/옵션 · 제작 공정 통합 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🛠️ 제작 마감 임박/지연 주문건:<strong className="stat-value">{cachedDelayedCount}건</strong></div>
          <div className="stat-card">🎁 대표 인기 커스텀 수상품:<strong className="stat-value-alert">{cachedRecentOrder}</strong></div>
        </div>
        <small className="warn-desc">* 매니저(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 지연 수 및 최근 주문 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 아티잔:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-6001">김공방 수석아티잔 (직원 A)</option>
            <option value="STF-6002">이목수 가구장인 (직원 B)</option>
            <option value="STF-6003">박도예 공예장인</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 공방 DB 리셋</button>
      </div>
    </header>
  );
}

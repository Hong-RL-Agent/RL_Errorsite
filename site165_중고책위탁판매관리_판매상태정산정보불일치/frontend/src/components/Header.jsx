import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingSettlementCount, cachedRecentConsignor, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="logo-title">UsedBookConsign</span>
        <span className="logo-subtitle">중고책 위탁 접수 · 검수 등급 · 판매 대금 정산 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📚 정산 대기중 위탁 판매건:<strong className="stat-value">{cachedPendingSettlementCount}건</strong></div>
          <div className="stat-card">💰 최우선 입금 정산 위탁자:<strong className="stat-value-alert">{cachedRecentConsignor}</strong></div>
        </div>
        <small className="warn-desc">* 매니저(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 정산대기 수 및 최근 위탁자 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 위탁 정산 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-3301">김위탁 총괄 매니저 (직원 A)</option>
            <option value="STF-3302">이정산 소설/에세이 매니저 (직원 B)</option>
            <option value="STF-3303">박검수 등급 감정사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 위탁 정산 DB 리셋</button>
      </div>
    </header>
  );
}

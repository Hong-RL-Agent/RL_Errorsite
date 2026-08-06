import React from 'react';

export default function Header({
  activeAdmin,
  handleAdminSwitch,
  cachedRefundAmount,
  cachedPickupDateMemo,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        <span className="logo-title">ReturnHub</span>
        <span className="logo-subtitle">E-Commerce Return & Refund Operations</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>💰 최근 열람 환불 예정 금액:</span>
            <strong className="stat-value">{cachedRefundAmount?.toLocaleString()}원</strong>
          </div>
          <div className="stat-card">
            <span>📦 수거 일정 및 처리 메모:</span>
            <strong className="stat-value-alert">{cachedPickupDateMemo}</strong>
          </div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 반품 목록은 B로 갱신되나 오른쪽 환불 금액, 수거 일정, 메모는 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeAdmin} onChange={(e) => handleAdminSwitch(e.target.value)}>
            <option value="ADM-01">김반품 팀장 (관리자 A)</option>
            <option value="ADM-02">박환불 실장 (관리자 B)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 쇼핑몰 DB 리셋
        </button>
      </div>
    </header>
  );
}

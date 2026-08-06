import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedHoldCount, cachedRecentParcel, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11" /><polyline points="22 7 12 13 2 7" /><path d="M16 19h6" /><path d="M19 16l3 3-3 3" />
        </svg>
        <span className="logo-title">PostRoute</span>
        <span className="logo-subtitle">우편물 스마트 접수 · 분류센터 라우팅 · 배송 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📦 미배달 보류 우편:<strong className="stat-value">{cachedHoldCount}건</strong></div>
          <div className="stat-card">📮 최근 간선 상차:<strong className="stat-value-alert">{cachedRecentParcel}</strong></div>
        </div>
        <small className="warn-desc">* 담당 직원(A ➔ B) 변경 시 목록은 B 담당 기준 변경되나 상단 보류 우편 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-5001">김우체 동서울센터장 (직원 A)</option>
            <option value="STF-5002">이물류 집하팀장 (직원 B)</option>
            <option value="STF-5003">박배송 집배원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 물류 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingCount, cachedRecentCall, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="12" rx="2" /><path d="M7 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" /><circle cx="6" cy="15" r="1.5" /><circle cx="18" cy="15" r="1.5" />
        </svg>
        <span className="logo-title">TaxiDispatch</span>
        <span className="logo-subtitle">택시 스마트 실시간 관제 · LPR 위치배차 · 수수료 정산 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🚖 배차 대기 미배정 호출:<strong className="stat-value">{cachedPendingCount}건</strong></div>
          <div className="stat-card">🚕 장거리 최우선 운행 건:<strong className="stat-value-alert">{cachedRecentCall}</strong></div>
        </div>
        <small className="warn-desc">* 관제사(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미배차 수 및 주요 호출 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관제사:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-1001">김관제 센터장 (관제사 A)</option>
            <option value="STF-1002">이정산 팀장 (관제사 B)</option>
            <option value="STF-1003">박모니터 관제원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 택시 DB 리셋</button>
      </div>
    </header>
  );
}

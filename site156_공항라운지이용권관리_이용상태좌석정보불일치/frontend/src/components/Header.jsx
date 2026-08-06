import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedExpiringSoonCount, cachedRecentPassenger, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /><path d="M14 2v4h4" />
        </svg>
        <span className="logo-title">LoungePass</span>
        <span className="logo-subtitle">공항 프리미엄 라운지 이용권 · 탑승권 체크인 · 좌석 배정 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">✈️ 이용 만료 임박 승객 이용권:<strong className="stat-value">{cachedExpiringSoonCount}건</strong></div>
          <div className="stat-card">👑 퍼스트클래스 최다 이용 승객:<strong className="stat-value-alert">{cachedRecentPassenger}</strong></div>
        </div>
        <small className="warn-desc">* 매니저(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 만료임박 수 및 최근 승객 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 라운지 매니저:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-8001">김라운지 T1 총괄매니저 (직원 A)</option>
            <option value="STF-8002">이체크 T2 퍼스트매니저 (직원 B)</option>
            <option value="STF-8003">박승객 탑승동매니저</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 라운지 DB 리셋</button>
      </div>
    </header>
  );
}

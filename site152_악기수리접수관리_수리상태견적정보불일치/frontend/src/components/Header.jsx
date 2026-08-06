import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedEstimatingCount, cachedRecentRepair, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
        <span className="logo-title">InstrumentFix</span>
        <span className="logo-subtitle">수제 악기 전문 공방 수리 접수 · 복원 견적 · 작업 출고 관리</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🎻 수리 정밀 진단 & 견적 대기:<strong className="stat-value">{cachedEstimatingCount}건</strong></div>
          <div className="stat-card">🎷 최고가 프리미엄 복원 접수건:<strong className="stat-value-alert">{cachedRecentRepair}</strong></div>
        </div>
        <small className="warn-desc">* 마스터(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 견적대기 수 및 최근 수리 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 마스터:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-4001">김수리 수석루티어 (직원 A)</option>
            <option value="STF-4002">이견적 조율사 (직원 B)</option>
            <option value="STF-4003">박피아노 명장</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 공방 DB 리셋</button>
      </div>
    </header>
  );
}

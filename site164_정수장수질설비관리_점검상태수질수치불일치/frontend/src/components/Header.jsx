import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedWarningAlertCount, cachedRecentEquip, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        <span className="logo-title">WaterPlant</span>
        <span className="logo-subtitle">정수장 수질 측정 수치 · 설비 점검 · 실시간 이상 경보 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">💧 수질 탁도/pH 경보 알림건:<strong className="stat-value">{cachedWarningAlertCount}건</strong></div>
          <div className="stat-card">⚙️ 집중 관제 정수 설비:<strong className="stat-value-alert">{cachedRecentEquip}</strong></div>
        </div>
        <small className="warn-desc">* 관제총괄(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 알림 수 및 최근 설비 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 정수장 총괄:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="OPR-4401">김수질 제1정수장 총괄 (관리자 A)</option>
            <option value="OPR-4402">이침전 제2정수장 총괄 (관리자 B)</option>
            <option value="OPR-4403">박소독 오존소독 기사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 정수장 관제 DB 리셋</button>
      </div>
    </header>
  );
}

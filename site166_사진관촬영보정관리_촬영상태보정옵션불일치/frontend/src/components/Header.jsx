import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedPendingRetouchCount, cachedRecentCustomer, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
        </svg>
        <span className="logo-title">PhotoStudioOps</span>
        <span className="logo-subtitle">사진관 촬영 예약 · 1:1 리터칭 옵션 · 앨범 출고 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📷 1:1 보정 작업 대기건:<strong className="stat-value">{cachedPendingRetouchCount}건</strong></div>
          <div className="stat-card">🖼️ 최우선 출고 앨범/액자:<strong className="stat-value-alert">{cachedRecentCustomer}</strong></div>
        </div>
        <small className="warn-desc">* 실장(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 보정대기 수 및 최근 예약 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 스튜디오 실장:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-2201">김스튜디오 본점 수석 (직원 A)</option>
            <option value="STF-2202">이보정 웨딩/스냅 담당 (직원 B)</option>
            <option value="STF-2203">박리터칭 색보정 기사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 스튜디오 DB 리셋</button>
      </div>
    </header>
  );
}

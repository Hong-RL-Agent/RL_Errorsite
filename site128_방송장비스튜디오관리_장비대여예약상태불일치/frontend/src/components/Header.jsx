import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedReturnPendingCount, cachedRecentGear, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <span className="logo-title">StudioGear</span>
        <span className="logo-subtitle">방송 제작 장비 대여 · 스튜디오 예약 · 반납 및 정비 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🎬 반납 대기 장비:<strong className="stat-value">{cachedReturnPendingCount}건</strong></div>
          <div className="stat-card">🎥 최근 최고 가동 장비:<strong className="stat-value-alert">{cachedRecentGear}</strong></div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 반납대기 수 및 최근 장비 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-6001">김스튜디오 총괄감독 (관리자 A)</option>
            <option value="STF-6002">이장비 관리팀장 (관리자 B)</option>
            <option value="STF-6003">박음향 오디오엔지니어</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 장비 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedSettlingCount, cachedRecentTrack, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
        <span className="logo-title">RoyaltyTune</span>
        <span className="logo-subtitle">음악 저작권 인세 · 음원 사용 내역 · 권리자 분배 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🎵 정산 대기 음원:<strong className="stat-value">{cachedSettlingCount}곡</strong></div>
          <div className="stat-card">🎧 최근 정산확정 음원:<strong className="stat-value-alert">{cachedRecentTrack}</strong></div>
        </div>
        <small className="warn-desc">* 담당자 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 정산대기 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-8001">김저작 총괄이사 (관리자 A)</option>
            <option value="STF-8002">이정산 정산팀장 (관리자 B)</option>
            <option value="STF-8003">박권리 법무담당</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 저작권 DB 리셋</button>
      </div>
    </header>
  );
}

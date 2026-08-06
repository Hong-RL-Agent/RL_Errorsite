import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedSettlingCount, cachedRecentAuthor, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="logo-title">PublishLedger</span>
        <span className="logo-subtitle">출판사 도서 계약 · 저자 인세 · 판매 정산 통합 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📚 정산 대기 계약:<strong className="stat-value">{cachedSettlingCount}건</strong></div>
          <div className="stat-card">✍️ 최근 저자 정산:<strong className="stat-value-alert">{cachedRecentAuthor}</strong></div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 정산대기 수 및 최근 저자 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 직원:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-3001">김출판 기획이사 (직원 A)</option>
            <option value="STF-3002">이정산 재무팀장 (직원 B)</option>
            <option value="STF-3003">박계약 법무담당</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 출판 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedTodayCounselCount, cachedRecentClient, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" />
        </svg>
        <span className="logo-title">CounselNote</span>
        <span className="logo-subtitle">온라인 심리 상담 예약 · 상담사 배정 · 비밀 상담 기록 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🗓️ 오늘 진행 예정 상담 수:<strong className="stat-value">{cachedTodayCounselCount}건</strong></div>
          <div className="stat-card">💬 최고 우수 만족도 내담자:<strong className="stat-value-alert">{cachedRecentClient}</strong></div>
        </div>
        <small className="warn-desc">* 상담사(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 오늘 상담 수 및 최근 내담자 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 상담사:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-7001">김심리 수석센터장 (직원 A)</option>
            <option value="STF-7002">이마음 멘탈케어관 (직원 B)</option>
            <option value="STF-7003">박코칭 수석상담사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 상담센터 DB 리셋</button>
      </div>
    </header>
  );
}

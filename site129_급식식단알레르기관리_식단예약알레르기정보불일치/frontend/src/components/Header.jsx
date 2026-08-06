import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedSubPendingCount, cachedRecentStudent, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-2h2zm0-4h-2v-5h2z" />
        </svg>
        <span className="logo-title">MealSafe</span>
        <span className="logo-subtitle">학교 급식 식단 · 학생 알레르기 안전 · 대체식 신청 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🍱 대체식 승인 대기:<strong className="stat-value">{cachedSubPendingCount}건</strong></div>
          <div className="stat-card">⚠️ 고위험 알레르기 학생:<strong className="stat-value-alert">{cachedRecentStudent}</strong></div>
        </div>
        <small className="warn-desc">* 영양사 계정(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 대체식 대기 수 및 최근 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 영양사:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-7001">김영양 수석영양사 (영양사 A)</option>
            <option value="STF-7002">이조리 급식조리장 (영양사 B)</option>
            <option value="STF-7003">박위생 검수원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 급식 DB 리셋</button>
      </div>
    </header>
  );
}

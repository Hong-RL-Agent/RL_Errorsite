import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedClosedCount, cachedRecentCourse, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="logo-title">CultureClass</span>
        <span className="logo-subtitle">시민 문화센터 강좌 기획 · 수강신청 · 출석 & 강의실 배정 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📚 정원 마감 완료 강좌 수:<strong className="stat-value">{cachedClosedCount}개</strong></div>
          <div className="stat-card">🎨 최고 수강률 인기 강좌:<strong className="stat-value-alert">{cachedRecentCourse}</strong></div>
        </div>
        <small className="warn-desc">* 매니저(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 마감 수 및 최근 강좌 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-5001">김문화 기획팀장 (직원 A)</option>
            <option value="STF-5002">이강좌 아카데미학장 (직원 B)</option>
            <option value="STF-5003">박강사 강사배정원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 문화센터 DB 리셋</button>
      </div>
    </header>
  );
}

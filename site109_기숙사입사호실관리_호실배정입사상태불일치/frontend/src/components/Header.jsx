import React from 'react';

export default function Header({
  activeStaff,
  handleStaffSwitch,
  cachedWaitingApplicants,
  cachedRecentStudent,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <span className="logo-title">DormLink</span>
        <span className="logo-subtitle">University Dormitory Allocation & Student Housing Ops</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🎓 선발 대기 신청자:</span>
            <strong className="stat-value">{cachedWaitingApplicants}명</strong>
          </div>
          <div className="stat-card">
            <span>👤 최근 입사 학생 요약:</span>
            <strong className="stat-value-alert">{cachedRecentStudent}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 학생 목록은 B 권한으로 바뀌나 상단 대기자 수 및 최근 학생 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 사감/관장:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STAFF-4001">김행정 관장 (생활관 총괄 - 직원 A)</option>
            <option value="STAFF-4002">이호실 사감 (명덕관 사관 - 직원 B)</option>
            <option value="STAFF-4007">조상담 팀장 (학생 상담실)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 기숙사 행정 DB 리셋
        </button>
      </div>
    </header>
  );
}

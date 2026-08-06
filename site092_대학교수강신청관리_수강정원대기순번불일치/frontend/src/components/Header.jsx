import React from 'react';

export default function Header({
  activeStudent,
  handleStudentSwitch,
  cachedCredits,
  cachedRecentCourse,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <span className="logo-title">UniCourse</span>
        <span className="logo-subtitle">Academic Course Registration & Timetable Control System</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🎓 신청 완료 학점:</span>
            <strong className="stat-value">{cachedCredits}학점 / 18학점</strong>
          </div>
          <div className="stat-card">
            <span>📚 최근 신청 강의:</span>
            <strong className="stat-value-alert">{cachedRecentCourse}</strong>
          </div>
        </div>
        <small className="warn-desc">* 학생 계정(A ➔ B) 변경 시 강의 목록은 B 기준으로 바뀌나 상단 신청학점 및 시간표 요약은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 학생/계정:</span>
          <select value={activeStudent} onChange={(e) => handleStudentSwitch(e.target.value)}>
            <option value="STD-202601">김코딩 (컴공 3학년 - 학생 A)</option>
            <option value="STD-202602">이알고 (컴공 2학년 - 학생 B)</option>
            <option value="STD-202603">박데이터 (AI 3학년)</option>
            <option value="TA">박조교 (학과 조교)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 학사 PMS DB 리셋
        </button>
      </div>
    </header>
  );
}

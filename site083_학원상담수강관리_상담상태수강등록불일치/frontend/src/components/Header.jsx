import React from 'react';

export default function Header({
  activeCounselor,
  handleCounselorSwitch,
  cachedStudentDetail,
  cachedPendingConsultCount,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <span className="logo-title">EduBridge</span>
        <span className="logo-subtitle">Academy Consultation & Course Hub</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🎓 상담 예정 건수:</span>
            <strong className="stat-value">{cachedPendingConsultCount}건</strong>
          </div>
          <div className="stat-card">
            <span>📋 최근 열람 학생 상담 상세:</span>
            <strong className="stat-value-alert">{cachedStudentDetail}</strong>
          </div>
        </div>
        <small className="warn-desc">* 상담사 계정(A ➔ B) 변경 시 학생 목록은 B로 갱신되나 오른쪽 상담 상세와 상담 예정 건수는 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="counselor-selector">
          <span>로그인 상담사:</span>
          <select value={activeCounselor} onChange={(e) => handleCounselorSwitch(e.target.value)}>
            <option value="CNS-01">박상담 팀장 (상담사 A)</option>
            <option value="CNS-02">최수석 실장 (상담사 B)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 학원 DB 리셋
        </button>
      </div>
    </header>
  );
}

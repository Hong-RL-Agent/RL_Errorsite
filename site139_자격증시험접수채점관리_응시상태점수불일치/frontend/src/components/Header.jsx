import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedUnscoredCount, cachedRecentExaminee, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <span className="logo-title">CertiExam</span>
        <span className="logo-subtitle">국가자격증 시험 접수 · CBT 고사장 배정 · 채점 결과 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">📝 채점 대기 답안 건수:<strong className="stat-value">{cachedUnscoredCount}건</strong></div>
          <div className="stat-card">🎓 대표 수험자 응시 과목:<strong className="stat-value-alert">{cachedRecentExaminee}</strong></div>
        </div>
        <small className="warn-desc">* 감독관(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미채점 수 및 주요 수험자 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 감독관:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-9001">김감독 위원장 (감독관 A)</option>
            <option value="STF-9002">이채점 전담관 (감독관 B)</option>
            <option value="STF-9003">박시험 진행요원</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 시험 DB 리셋</button>
      </div>
    </header>
  );
}

import React from 'react';

export default function Header({
  activeUser,
  handleUserSwitch,
  cachedVotedCount,
  cachedRecentResultTitle,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
        <span className="logo-title">VoteSquare</span>
        <span className="logo-subtitle">Public Opinion Console</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🗳️ 참여 완료 투표수:</span>
            <strong className="stat-value">{cachedVotedCount}건</strong>
          </div>
          <div className="stat-card">
            <span>📊 최근 열람 결과:</span>
            <strong className="stat-value-alert">{cachedRecentResultTitle}</strong>
          </div>
        </div>
        <small className="warn-desc">* 사용자 계정(A ➔ B) 변경 시 투표 목록은 B로 갱신되나 상단 참여 완료 개수와 최근 결과는 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="user-selector">
          <span>로그인 투표자:</span>
          <select value={activeUser} onChange={(e) => handleUserSwitch(e.target.value)}>
            <option value="USER_A">유저 A (김철수 회원)</option>
            <option value="USER_B">유저 B (이영희 회원)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 투표소 리셋
        </button>
      </div>
    </header>
  );
}

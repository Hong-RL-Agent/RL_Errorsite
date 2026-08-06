import React from 'react';

export default function Header({
  activeTrainer,
  handleTrainerSwitch,
  cachedTodayReservations,
  cachedRecentMember,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 7v10M22 7v10" />
        </svg>
        <span className="logo-title">FitMember</span>
        <span className="logo-subtitle">Fitness Membership & PT Schedule Ops</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🏋️ 오늘 PT 예약 건수:</span>
            <strong className="stat-value">{cachedTodayReservations}건</strong>
          </div>
          <div className="stat-card">
            <span>👤 최근 이용 회원 요약:</span>
            <strong className="stat-value-alert">{cachedRecentMember}</strong>
          </div>
        </div>
        <small className="warn-desc">* 직원 계정(A ➔ B) 변경 시 회원 목록은 B 권한으로 바뀌나 상단 오늘 예약 수 및 최근 회원 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 트레이너:</span>
          <select value={activeTrainer} onChange={(e) => handleTrainerSwitch(e.target.value)}>
            <option value="TRN-3001">김피트 수석 (보디빌딩 - 직원 A)</option>
            <option value="TRN-3002">이웨이트 선임 (체형교정 - 직원 B)</option>
            <option value="TRN-3003">박필라 팀장 (필라테스)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 피트니스 센터 DB 리셋
        </button>
      </div>
    </header>
  );
}

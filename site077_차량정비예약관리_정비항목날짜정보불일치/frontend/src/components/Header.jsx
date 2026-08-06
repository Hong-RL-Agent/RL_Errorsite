import React from 'react';

export default function Header({
  activeUser,
  handleUserSwitch,
  cachedCarNumber,
  cachedLastServiceItem,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.2 1 11.8 1 12.5V16c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
        <span className="logo-title">AutoCare</span>
        <span className="logo-subtitle">Vehicle Maintenance Hub</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>🚘 등록 차량 번호:</span>
            <strong className="stat-value">{cachedCarNumber}</strong>
          </div>
          <div className="stat-card">
            <span>🔧 최근 정비 항목:</span>
            <strong className="stat-value-alert">{cachedLastServiceItem}</strong>
          </div>
        </div>
        <small className="warn-desc">* 사용자 계정(A ➔ B) 변경 시 예약 목록은 B로 갱신되나 상단 차량 번호와 최근 정비 이력은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="user-selector">
          <span>로그인 차주:</span>
          <select value={activeUser} onChange={(e) => handleUserSwitch(e.target.value)}>
            <option value="USER_A">차주 A (김철수 회원 - 12가 3456)</option>
            <option value="USER_B">차주 B (이영희 회원 - 56나 7890)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 정비소 리셋
        </button>
      </div>
    </header>
  );
}

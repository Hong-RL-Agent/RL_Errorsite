import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedShortageCount, cachedRecentDonor, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="logo-title">BloodReserve</span>
        <span className="logo-subtitle">헌혈 센터 예약 · 사전 문진 · 혈액형별 보유 재고 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🩸 긴급 재고 주의 혈액형:<strong className="stat-value">{cachedShortageCount}개 형 (Rh- 포함)</strong></div>
          <div className="stat-card">🩸 최우선 채혈 전혈 예약:<strong className="stat-value-alert">{cachedRecentDonor}</strong></div>
        </div>
        <small className="warn-desc">* 센터장(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 부족 혈액형 수 및 최근 문진 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 헌혈 센터장:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-7701">김혈액 서울중앙 센터장 (직원 A)</option>
            <option value="STF-7702">이문진 강남역 수석간호사 (직원 B)</option>
            <option value="STF-7703">박재고 신촌 검수기사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 혈액원 DB 리셋</button>
      </div>
    </header>
  );
}

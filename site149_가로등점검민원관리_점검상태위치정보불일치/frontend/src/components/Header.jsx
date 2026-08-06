import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedUnprocessedCount, cachedRecentReport, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v10M12 12l-4 8M12 12l4 8M8 6h8" strokeLinecap="round" />
        </svg>
        <span className="logo-title">StreetLightOps</span>
        <span className="logo-subtitle">스마트 도시 가로등 고장 신고 · 위치 지점 GPS · 점검 조치 관리</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">💡 미조치 접수 고장 가로등:<strong className="stat-value">{cachedUnprocessedCount}건</strong></div>
          <div className="stat-card">⚠️ 주요 위험 긴급 신고 지점:<strong className="stat-value-alert">{cachedRecentReport}</strong></div>
        </div>
        <small className="warn-desc">* 담당자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 미조치 수 및 주요 위치 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 담당자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-1001">김도시 총괄팀장 (직원 A)</option>
            <option value="STF-1002">이점검 스마트관제원 (직원 B)</option>
            <option value="STF-1003">박전기 점검기사</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 시설물 DB 리셋</button>
      </div>
    </header>
  );
}

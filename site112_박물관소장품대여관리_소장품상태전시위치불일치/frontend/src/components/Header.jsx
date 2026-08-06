import React from 'react';

export default function Header({ activeCurator, handleCuratorSwitch, cachedPendingLoans, cachedRecentArtifact, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 20h20M4 20V10l8-7 8 7v10" /><rect x="9" y="14" width="6" height="6" rx="1" /><path d="M9 10h6" />
        </svg>
        <span className="logo-title">MuseumVault</span>
        <span className="logo-subtitle">박물관 소장품 전시 배치 & 외부 대여 통합 관제 시스템</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🏛️ 대여 대기:<strong className="stat-value">{cachedPendingLoans}건</strong></div>
          <div className="stat-card">📜 최근 소장품:<strong className="stat-value-alert">{cachedRecentArtifact}</strong></div>
        </div>
        <small className="warn-desc">* 학예사 A → B 전환 시 소장품 목록은 B 담당 기준이나 상단 대여 대기 수 및 최근 소장품 알림 캐시는 A 데이터 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 학예사:</span>
          <select value={activeCurator} onChange={(e) => handleCuratorSwitch(e.target.value)}>
            <option value="CUR-8001">김고려 수석 학예사 (고고학 - 학예사 A)</option>
            <option value="CUR-8002">이조선 전문 학예사 (회화 - 학예사 B)</option>
            <option value="CUR-8007">조보존 보존과학 전문</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 DB 리셋</button>
      </div>
    </header>
  );
}

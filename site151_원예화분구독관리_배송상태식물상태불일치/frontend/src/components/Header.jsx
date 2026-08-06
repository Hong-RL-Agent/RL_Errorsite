import React from 'react';

export default function Header({ activeStaff, handleStaffSwitch, cachedReplacementPendingCount, cachedRecentSubscriber, resetSandbox }) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z" /><path d="M12 6v12M8 10h8" />
        </svg>
        <span className="logo-title">PlantSub</span>
        <span className="logo-subtitle">원예 화분 정기 구독 배송 · 식물 건강도 진단 · 화분 교체 신청 관제</span>
      </div>
      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">🪴 교체 신청 대기 건수:<strong className="stat-value">{cachedReplacementPendingCount}건</strong></div>
          <div className="stat-card">🌿 최고 위험 케어 수강 고객:<strong className="stat-value-alert">{cachedRecentSubscriber}</strong></div>
        </div>
        <small className="warn-desc">* 관리자(A ➔ B) 변경 시 목록은 B 권한 기준 변경되나 상단 교체대기 수 및 최근 식물 알림 캐시는 A 잔존 (Error 6)</small>
      </div>
      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeStaff} onChange={(e) => handleStaffSwitch(e.target.value)}>
            <option value="STF-3001">김식물 총괄팀장 (직원 A)</option>
            <option value="STF-3002">이화분 큐레이터 (직원 B)</option>
            <option value="STF-3003">박가드너 원예닥터</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>🔄 원예 DB 리셋</button>
      </div>
    </header>
  );
}

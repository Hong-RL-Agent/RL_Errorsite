import React from 'react';

export default function Header({
  activeAdmin,
  handleAdminSwitch,
  cachedExpectedBilling,
  cachedUsageAlert,
  resetSandbox
}) {
  return (
    <header className="app-header">
      <div className="logo-group">
        <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <path d="M12 13v4m-2-2h4" />
        </svg>
        <span className="logo-title">CloudPlan</span>
        <span className="logo-subtitle">SaaS Subscription & License Console</span>
      </div>

      <div className="header-dashboard">
        <div className="kpis-group">
          <div className="stat-card">
            <span>💳 이번 달 청구 예정:</span>
            <strong className="stat-value">₩{cachedExpectedBilling.toLocaleString()}원</strong>
          </div>
          <div className="stat-card">
            <span>🚨 사용량 임계 알림:</span>
            <strong className="stat-value-alert">{cachedUsageAlert}</strong>
          </div>
        </div>
        <small className="warn-desc">* 관리자 계정(A ➔ B) 변경 시 조직 목록은 B 권한으로 바뀌나 상단 청구액 및 최근 사용량 알림은 A 캐시가 남음 (Error 6)</small>
      </div>

      <div className="header-controls">
        <div className="admin-selector">
          <span>로그인 관리자:</span>
          <select value={activeAdmin} onChange={(e) => handleAdminSwitch(e.target.value)}>
            <option value="ADM-101">김클라우드 CTO (테크노바 - 관리자 A)</option>
            <option value="ADM-102">이구독 리드 (넥스트아이티 - 관리자 B)</option>
            <option value="ADM-103">박서버 팀장 (일반 스태프)</option>
          </select>
        </div>
        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 구독 DB 리셋
        </button>
      </div>
    </header>
  );
}

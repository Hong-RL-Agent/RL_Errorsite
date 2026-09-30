import React from 'react';

export default function Header({ currentTab, onNavigate, favoriteCount = 0, onSearch }) {
  return (
    <header className="header-wrapper">
      {/* Top Banner Notice */}
      <div className="header-top-notice">
        <div className="header-top-inner">
          <div className="notice-left">
            <span className="notice-badge">HOT ISSUE</span>
            <span>2026 하반기 대형 뮤지컬 & 클래식 리사이틀 얼리버드 예매 오픈!</span>
          </div>
          <div className="notice-right">
            <span>고객센터 1588-0000</span>
            <span className="divider-dot">•</span>
            <span>공연장 제휴안내</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="header-inner">
        {/* Brand Logo */}
        <div className="logo-wrap" onClick={() => onNavigate('home')} role="button" tabIndex={0}>
          <div className="logo-icon-box">🎟️</div>
          <div className="logo-text-box">
            <div className="logo-text-title">Culture<span>Pick</span></div>
            <div className="logo-sub-tag">컬처픽 티켓</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-links-menu">
          <button
            className={`nav-menu-btn ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            홈
          </button>
          <button
            className={`nav-menu-btn ${currentTab === 'events' ? 'active' : ''}`}
            onClick={() => onNavigate('events')}
          >
            공연·전시
          </button>
          <button
            className={`nav-menu-btn ${currentTab === 'venues' ? 'active' : ''}`}
            onClick={() => onNavigate('venues')}
          >
            공연장
          </button>
          <button
            className={`nav-menu-btn ${currentTab === 'mypage' ? 'active' : ''}`}
            onClick={() => onNavigate('mypage')}
          >
            마이페이지
            {favoriteCount > 0 && <span className="nav-badge-pill">{favoriteCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}

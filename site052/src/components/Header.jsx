import React from 'react';

export default function Header({ activePage, setActivePage, favoritesCount = 0 }) {
  return (
    <header className="header-wrapper">
      <div className="header-inner">
        <div className="logo-area" onClick={() => setActivePage('home')}>
          <div className="logo-icon">S</div>
          <div className="logo-text">Space<span>Mate</span></div>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            홈
          </button>
          <button 
            className={`nav-item ${activePage === 'rooms' ? 'active' : ''}`}
            onClick={() => setActivePage('rooms')}
          >
            공간 찾기
          </button>
          <button 
            className={`nav-item ${activePage === 'bookings' ? 'active' : ''}`}
            onClick={() => setActivePage('bookings')}
          >
            예약 내역
          </button>
          <button 
            className={`nav-item ${activePage === 'workspace' ? 'active' : ''}`}
            onClick={() => setActivePage('workspace')}
          >
            내 워크스페이스
          </button>
          <button 
            className={`nav-item ${activePage === 'notices' ? 'active' : ''}`}
            onClick={() => setActivePage('notices')}
          >
            공지사항
          </button>
        </nav>

        <div className="header-profile">
          <div className="profile-avatar">JM</div>
          <div className="profile-name">정민우 프로</div>
        </div>
      </div>
    </header>
  );
}

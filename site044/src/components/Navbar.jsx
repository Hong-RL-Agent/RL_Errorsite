import React from 'react';
import { Search, Calendar, Heart, User, UtensilsCrossed } from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  reservationCount = 0,
  wishlistCount = 0,
  currentPage,
  setCurrentPage
}) {
  return (
    <header className="header-wrap">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand-logo-wrap" onClick={() => setCurrentPage('home')}>
          <div className="logo-badge">T</div>
          <div className="brand-titles">
            <h1>TableNow</h1>
            <p>DINING & RESERVATION</p>
          </div>
        </div>

        {/* Search */}
        <div className="nav-search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="식당명, 지역(강남, 한남, 성수), 오마카세, 파스타 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Nav Links */}
        <div className="nav-menu-links">
          <button
            className={`nav-tab-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <UtensilsCrossed size={16} />
            다이닝 탐색
          </button>

          <button
            className={`nav-tab-btn ${currentPage === 'reservations' ? 'active' : ''}`}
            onClick={() => setCurrentPage('reservations')}
          >
            <Calendar size={16} />
            예약 내역
            {reservationCount > 0 && (
              <span style={{ background: '#c2410c', color: '#fff', fontSize: 11, padding: '1px 6px', borderRadius: 9999, fontWeight: 700 }}>
                {reservationCount}
              </span>
            )}
          </button>

          <button
            className={`nav-tab-btn ${currentPage === 'wishlist' ? 'active' : ''}`}
            onClick={() => setCurrentPage('wishlist')}
          >
            <Heart size={16} />
            저장 ({wishlistCount})
          </button>

          <button
            className={`nav-tab-btn ${currentPage === 'mypage' ? 'active' : ''}`}
            onClick={() => setCurrentPage('mypage')}
          >
            <User size={16} />
            마이페이지
          </button>
        </div>
      </div>
    </header>
  );
}

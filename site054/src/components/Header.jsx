import React from 'react';

export default function Header({ activePage, setActivePage, searchQuery, setSearchQuery, onSearch }) {
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    setActivePage('books');
  };

  return (
    <header className="header-wrapper">
      {/* Top Library Notice */}
      <div className="header-top-notice">
        <div className="header-top-inner">
          <div>
            <span>🏛️ BookNest 스마트 전자도서관 &middot; 누적 소장도서 50,000+ 권</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>이용안내</span>
            <span>희망도서신청</span>
            <span>도서관 운영시간: 24시간 온라인 대여</span>
          </div>
        </div>
      </div>

      {/* Main Header Inner */}
      <div className="header-inner">
        {/* Logo */}
        <div className="logo-wrap" onClick={() => setActivePage('home')}>
          <div className="logo-icon-box">📚</div>
          <div className="logo-text-title">
            Book<span>Nest</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form className="search-input-wrap" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-box-input"
            placeholder="책 제목, 저자 또는 키워드를 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-enter-btn" title="검색">
            🔍
          </button>
        </form>

        {/* Nav Links */}
        <nav className="nav-links-menu">
          <button
            className={`nav-menu-btn ${activePage === 'books' ? 'active' : ''}`}
            onClick={() => setActivePage('books')}
          >
            도서관
          </button>
          <button
            className={`nav-menu-btn ${activePage === 'loans' ? 'active' : ''}`}
            onClick={() => setActivePage('loans')}
          >
            내 대여
            <span className="nav-badge-dot"></span>
          </button>
          <button
            className={`nav-menu-btn ${activePage === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActivePage('wishlist')}
          >
            찜 목록
          </button>
          <button
            className={`nav-menu-btn ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            내 서재
          </button>
        </nav>
      </div>
    </header>
  );
}

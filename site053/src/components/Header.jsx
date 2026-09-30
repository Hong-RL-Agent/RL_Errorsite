import React, { useState } from 'react';

export default function Header({
  activePage,
  setActivePage,
  searchQuery,
  setSearchQuery,
  onSearch,
  currentLocation = '서울 마포구 망원동',
  onChangeLocation
}) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const neighborhoods = [
    '서울 마포구 망원동',
    '서울 마포구 연남동',
    '서울 성동구 성수동',
    '경기 성남시 분당구 백현동',
    '서울 송파구 잠실동',
    '서울 영등포구 여의도동',
    '서울 종로구 혜화동',
    '서울 강서구 마곡동',
    '서울 강남구 역삼동',
    '서울 마포구 합정동'
  ];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    setActivePage('products');
  };

  const handleLocationSelect = (loc) => {
    if (onChangeLocation) onChangeLocation(loc);
    setShowLocationDropdown(false);
  };

  return (
    <header className="header-wrapper">
      {/* Utility Top Bar */}
      <div className="header-top-bar">
        <div className="header-top-inner">
          <div>
            <span>📍 내 위치: </span>
            <strong style={{ color: 'white' }}>{currentLocation}</strong>
            <span style={{ margin: '0 8px', color: '#475569' }}>|</span>
            <span>안심 직거래 이웃 플랫폼</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>고객센터 1588-0952</span>
            <span>매너온도 안내</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="header-inner">
        {/* Brand & Neighborhood Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="logo-container" onClick={() => setActivePage('home')}>
            <div className="logo-badge-icon">N</div>
            <div className="logo-text">
              Near<span>Buy</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              className="location-pill"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              title="내 동네 변경"
            >
              <span>📍</span>
              <span>{currentLocation ? currentLocation.split(' ').slice(-1)[0] : '내 동네'}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>▼</span>
            </div>

            {showLocationDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  background: 'white',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '230px',
                  zIndex: 300,
                  padding: '8px',
                  animation: 'modalScaleUp 0.15s ease'
                }}
              >
                <div style={{ padding: '8px 10px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                  거래 동네 선택
                </div>
                {neighborhoods.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLocationSelect(loc)}
                    style={{
                      padding: '9px 12px',
                      fontSize: '0.88rem',
                      fontWeight: currentLocation === loc ? '800' : '500',
                      color: currentLocation === loc ? 'var(--primary)' : 'var(--text-main)',
                      background: currentLocation === loc ? 'var(--primary-light)' : 'transparent',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{loc}</span>
                    {currentLocation === loc && <span style={{ fontSize: '0.85rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Commercial Search Bar */}
        <form className="search-bar-wrap" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input-field"
            placeholder="동네 이웃의 중고 물건을 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-submit-btn" title="검색">
            🔍
          </button>
        </form>

        {/* Menu Navigation */}
        <nav className="nav-menu">
          <button
            className={`nav-item-link ${activePage === 'products' ? 'active' : ''}`}
            onClick={() => setActivePage('products')}
          >
            동네상품
          </button>
          <button
            className={`nav-item-link ${activePage === 'chat' ? 'active' : ''}`}
            onClick={() => setActivePage('chat')}
          >
            채팅
            <span className="badge-dot"></span>
          </button>
          <button
            className={`nav-item-link ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            마이페이지
          </button>
          <button
            className="btn-sell-nav"
            onClick={() => setActivePage('sell')}
          >
            <span>+</span>
            <span>판매하기</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

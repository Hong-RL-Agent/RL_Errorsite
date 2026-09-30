import React from 'react';
import { Search, Heart, ShoppingBag, User, Package } from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  cartCount = 0,
  wishlistCount = 0,
  currentPage,
  setCurrentPage
}) {
  return (
    <header className="app-header">
      <div className="top-bar">
        {/* Brand */}
        <div className="brand-wrap" onClick={() => setCurrentPage('home')}>
          <div className="brand-icon">R</div>
          <div className="brand-text">
            <h1>Roomly</h1>
            <p>HOME & FURNITURE</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="소파, 식탁, 아치형 조명, 수납장 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Nav Actions */}
        <div className="header-actions">
          <button
            className="nav-icon-btn"
            onClick={() => setCurrentPage('orders')}
            title="주문/배송조회"
          >
            <Package size={20} />
          </button>

          <button
            className="nav-icon-btn"
            onClick={() => setCurrentPage('wishlist')}
            title="찜 목록"
          >
            <Heart size={20} />
            {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
          </button>

          <button
            className="nav-icon-btn"
            onClick={() => setCurrentPage('cart')}
            title="장바구니"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </button>

          <button
            className="nav-icon-btn"
            onClick={() => setCurrentPage('mypage')}
            title="마이페이지"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

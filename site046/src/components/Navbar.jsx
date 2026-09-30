import React from 'react';
import { ShoppingCart, Heart, PackageCheck, MapPin, Search, Coins, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, cartCount, wishlistCount, points, onSearch, searchQuery }) {
  return (
    <>
      <div className="top-notice-bar">
        <Sparkles size={16} />
        <span>FreshCart 아침 신선배송 — 밤 11시 전 주문 시 내일 아침 7시 문 앞 도착! (40,000원 이상 무료배송)</span>
      </div>

      <header className="navbar">
        <div className="nav-inner">
          <div 
            className="brand-logo" 
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('home')}
          >
            <div className="brand-icon">
              <ShoppingCart size={18} />
            </div>
            <span>FreshCart</span>
          </div>

          <div className="search-bar">
            <Search className="search-icon-btn" size={18} />
            <input
              type="text"
              placeholder="신선한 과일, 유기농 계란, 정육 검색..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <nav className="nav-actions">
            <button 
              className={`nav-link-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
              title="배송지 관리"
            >
              <MapPin size={20} />
              <span>배송지</span>
            </button>

            <button 
              className={`nav-link-btn ${activeTab === 'points' ? 'active' : ''}`}
              onClick={() => setActiveTab('points')}
              title="적립 포인트"
            >
              <Coins size={20} />
              <span>{points.toLocaleString()}P</span>
            </button>

            <button 
              className={`nav-link-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
              title="찜한 상품"
            >
              <Heart size={20} />
              <span>찜목록</span>
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </button>

            <button 
              className={`nav-link-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
              title="주문/배송 내역"
            >
              <PackageCheck size={20} />
              <span>주문내역</span>
            </button>

            <button 
              className={`nav-link-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
              title="장바구니"
            >
              <ShoppingCart size={20} />
              <span>장바구니</span>
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}

import React from 'react';
import { Search, ShoppingBag, Bell, PlusCircle } from 'lucide-react';

export default function Navbar({ searchTerm, setSearchTerm, cartCount, onOpenBookingModal, onNavigate }) {
  return (
    <header className="top-navbar">
      <div className="search-box">
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="요가, 필라테스, PT, 강사명 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button
          className="btn-primary-sm"
          onClick={onOpenBookingModal}
        >
          <PlusCircle size={16} />
          빠른 수업 예약
        </button>

        <button
          className="action-btn"
          onClick={() => onNavigate('cart')}
          title="장바구니"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
        </button>

        <button className="action-btn" title="알림">
          <Bell size={18} />
          <span className="action-badge">2</span>
        </button>
      </div>
    </header>
  );
}

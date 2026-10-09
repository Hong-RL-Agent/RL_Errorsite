import React from 'react';
import { ShoppingBag, Package, Sparkles, RotateCcw, Compass, ListOrdered } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  cartItemCount,
  onResetDb,
  isResetting
}) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setCurrentView('catalog')}>
        <div className="brand-icon">
          <ShoppingBag size={18} />
        </div>
        <div className="brand-titles">
          <span className="brand-title">MORROW MARKET</span>
          <span className="brand-subtitle">Editorial Luxury Boutique</span>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${currentView === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentView('catalog')}
        >
          <Compass size={15} />
          <span>컬렉션 (Catalog)</span>
        </button>

        <button
          className={`nav-btn ${currentView === 'checkout' ? 'active' : ''}`}
          onClick={() => setCurrentView('checkout')}
        >
          <ShoppingBag size={15} />
          <span>장바구니 & 결제</span>
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </button>

        <button
          className={`nav-btn ${currentView === 'orders' ? 'active' : ''}`}
          onClick={() => setCurrentView('orders')}
        >
          <ListOrdered size={15} />
          <span>주문 내역</span>
        </button>
      </nav>

      <button
        className="reset-top-btn"
        onClick={onResetDb}
        disabled={isResetting}
        title="POST /api/test/reset 초기화"
      >
        <RotateCcw size={13} className={isResetting ? 'animate-spin' : ''} />
        <span>{isResetting ? '초기화 중...' : '환경 리셋 (Reset DB)'}</span>
      </button>
    </header>
  );
}

import React from 'react';
import { UtensilsCrossed, ShoppingBag, Clock, RotateCcw, ListOrdered } from 'lucide-react';

export default function Header({
  currentView,
  setCurrentView,
  cartCount,
  onResetDb,
  isResetting
}) {
  return (
    <header className="top-header">
      <div className="brand-wrap" onClick={() => setCurrentView('menu')}>
        <div className="brand-logo-badge">
          <UtensilsCrossed size={20} />
        </div>
        <div>
          <div className="brand-name">TableRun</div>
          <div className="brand-sub">Fast & Fresh Delivery</div>
        </div>
      </div>

      <div className="nav-group">
        <button
          className={`nav-tab-btn ${currentView === 'menu' ? 'active' : ''}`}
          onClick={() => setCurrentView('menu')}
        >
          <UtensilsCrossed size={16} />
          <span>메뉴 보기</span>
        </button>

        <button
          className={`nav-tab-btn ${currentView === 'checkout' ? 'active' : ''}`}
          onClick={() => setCurrentView('checkout')}
        >
          <ShoppingBag size={16} />
          <span>주문서 / 결제</span>
          {cartCount > 0 && <span className="cart-pill-count">{cartCount}</span>}
        </button>

        <button
          className={`nav-tab-btn ${currentView === 'orders' ? 'active' : ''}`}
          onClick={() => setCurrentView('orders')}
        >
          <ListOrdered size={16} />
          <span>주문 내역</span>
        </button>

        <button
          className="btn-reset-env"
          onClick={onResetDb}
          disabled={isResetting}
          title="POST /api/test/reset 초기화"
        >
          <RotateCcw size={13} className={isResetting ? 'animate-spin' : ''} />
          <span>{isResetting ? '초기화 중...' : '환경 리셋 (Reset DB)'}</span>
        </button>
      </div>
    </header>
  );
}

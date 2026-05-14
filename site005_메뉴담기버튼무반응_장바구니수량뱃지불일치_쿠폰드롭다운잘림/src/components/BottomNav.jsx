import React from 'react';
import { Home, Heart, FileText, ShoppingCart, User } from 'lucide-react';

export default function BottomNav({ cartItemCount, onCartClick }) {
  return (
    <nav className="bottom-nav">
      <button className="nav-item active">
        <Home size={24} />
        홈
      </button>
      <button className="nav-item">
        <Heart size={24} />
        찜
      </button>
      <button className="nav-item">
        <FileText size={24} />
        주문내역
      </button>
      
      {/* INTENTIONAL GUI BUG: site005-bug02
         Type: state-mismatch
         Description: 장바구니 수량 표시가 실제 담긴 항목 수와 다르게 보인다.
         Explanation: cartItemCount prop을 사용하지 않고 하드코딩된 숫자(9)를 보여줌으로써 상태 불일치를 유발함. */}
      <button className="nav-item" onClick={onCartClick}>
        <div className="cart-icon-wrap">
          <ShoppingCart size={24} />
          <span className="cart-badge" data-bug-id="site005-bug02">
            9 
          </span>
        </div>
        장바구니
      </button>
      
      <button className="nav-item">
        <User size={24} />
        my
      </button>
    </nav>
  );
}

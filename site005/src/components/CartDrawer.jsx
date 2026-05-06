import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function CartDrawer({ cartItems, onClose, onRemove }) {
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>장바구니</h2>
          <button onClick={onClose} style={{ background: 'none' }}><X size={24} /></button>
        </div>
        
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            장바구니가 비어있습니다.
          </div>
        ) : (
          <div>
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>수량: {item.quantity}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 700 }}>{(item.price * item.quantity).toLocaleString()}원</div>
                  <button onClick={() => onRemove(item.id)} style={{ background: 'none', color: 'var(--danger)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button className="btn-checkout">
              {totalPrice.toLocaleString()}원 배달 주문하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

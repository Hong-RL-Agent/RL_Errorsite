import React from 'react';
import { X } from 'lucide-react';

export default function MiniCart({ isOpen, items, onClose, onRemove }) {
  const total = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className={`mini-cart ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        CART ({items.length})
        <button onClick={onClose}><X size={24} /></button>
      </div>
      <div className="cart-body">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-sub)' }}>
            Your cart is empty.
          </div>
        ) : (
          items.map(item => (
            <div key={item.cartId} className="cart-item">
              <div className="cart-item-img">{item.image}</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-meta">Color: <span style={{display:'inline-block', width:10, height:10, background:item.selectedColor, borderRadius:'50%'}}></span></div>
                <div className="cart-item-meta">Size: {item.selectedSize}</div>
                <div style={{ fontWeight: 700, marginTop: '8px' }}>{item.price.toLocaleString()} KRW</div>
              </div>
              <button onClick={() => onRemove(item.cartId)} style={{ height: 'fit-content', color: 'var(--text-sub)' }}>
                <X size={18} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="cart-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 700 }}>
          <span>SUBTOTAL</span>
          <span>{total.toLocaleString()} KRW</span>
        </div>
        <button style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', fontWeight: 700, letterSpacing: '1px' }}>
          CHECKOUT
        </button>
      </div>
    </div>
  );
}

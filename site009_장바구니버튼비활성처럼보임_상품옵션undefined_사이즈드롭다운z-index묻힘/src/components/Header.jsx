import React from 'react';
import { ShoppingBag, Search, User } from 'lucide-react';

export default function Header({ cartCount, onCartClick }) {
  return (
    <header className="header">
      <div className="logo">BLANC & NOIR</div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <button><Search size={24} /></button>
        <button><User size={24} /></button>
        <button onClick={onCartClick} style={{ position: 'relative' }}>
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              background: 'black', color: 'white', fontSize: '0.7rem',
              width: '18px', height: '18px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

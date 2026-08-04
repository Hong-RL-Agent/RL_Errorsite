import React from 'react';
import { ShoppingCart, User, Search, Heart } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">MOODBOX</div>
        
        <nav className="nav">
          <a href="#" className="nav-link">SUBSCRIPTIONS</a>
          <a href="#" className="nav-link">GIFTING</a>
          <a href="#" className="nav-link">REVIEWS</a>
        </nav>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => alert('Search feature coming soon.')}><Search size={22} /></button>
          <button onClick={() => alert('Wishlist feature coming soon.')}><Heart size={22} /></button>
          <button style={{ position: 'relative' }} onClick={() => alert('Shopping Cart is empty.')}>
            <ShoppingCart size={22} />
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem' }}>0</span>
          </button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => alert('Login required.')}>
            <User size={18} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> LOGIN
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

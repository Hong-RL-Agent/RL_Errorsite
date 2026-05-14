import React from 'react'

export default function Header({ cartCount, onCartClick, searchQuery, onSearchChange }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">Book<span>Haven</span></div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="책 제목, 저자 검색..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="도서 검색"
            id="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="cart-btn" onClick={onCartClick} id="cart-toggle-btn" aria-label="장바구니 열기">
          🛒 장바구니
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </header>
  )
}

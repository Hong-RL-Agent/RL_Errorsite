import React from 'react'

export default function CartPanel({ isOpen, cart, total, onClose, onRemove }) {
  return (
    <>
      <div className={`cart-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />
      <aside className={`cart-panel${isOpen ? ' open' : ''}`} aria-label="장바구니">
        <div className="cart-header">
          <h2>🛒 장바구니</h2>
          <button className="cart-close" onClick={onClose} id="cart-close-btn" aria-label="장바구니 닫기">✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="cart-empty">장바구니가 비어있습니다.<br />추천 도서 섹션에서 담아보세요! 📚</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-price">
                    ₩{item.price.toLocaleString()} &nbsp;
                    <span className="cart-qty">×{item.qty}</span>
                  </div>
                </div>
                <button
                  className="cart-remove"
                  onClick={() => onRemove(item.id)}
                  id={`cart-remove-${item.id}`}
                  aria-label={`${item.title} 삭제`}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>합계</span>
              <span>₩{total.toLocaleString()}</span>
            </div>
            <button className="cart-checkout" id="cart-checkout-btn">결제하기</button>
          </div>
        )}
      </aside>
    </>
  )
}

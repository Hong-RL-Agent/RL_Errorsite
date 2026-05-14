import React from "react";

export default function CartSummary({ cart, region, selectedDate, onPreparing }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  return (
    <aside className="cart-summary">
      <span>Cart summary</span>
      <h2>장바구니 요약</h2>
      <p>{region} · {selectedDate}</p>
      <div className="cart-list">{cart.length === 0 ? <em>담긴 상품이 없습니다.</em> : cart.map((item, index) => <div key={`${item.id}-${index}`}><strong>{item.name}</strong><span>{item.price.toLocaleString("ko-KR")}원</span></div>)}</div>
      <strong className="total">{total.toLocaleString("ko-KR")}원</strong>
      <button onClick={onPreparing}>주문서 작성</button>
    </aside>
  );
}

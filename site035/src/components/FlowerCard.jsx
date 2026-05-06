import React from "react";

export default function FlowerCard({ flower, liked, onToggleLike, onAddToCart, onOpenFlower }) {
  return (
    <article className={`flower-card ${flower.id === "fl-long" ? "height-bug-card" : ""}`} data-bug-id={flower.id === "fl-long" ? "site035-bug02" : undefined}>
      <img src={flower.image} alt={`${flower.name} 상품 이미지`} />
      <div className="flower-card-body">
        <div className="card-topline"><span>{flower.purpose}</span><button onClick={() => onToggleLike(flower.id)}>{liked ? "♥" : "♡"}</button></div>
        <h3>{flower.name}</h3>
        <strong>{flower.price.toLocaleString("ko-KR")}원</strong>
        {/* INTENTIONAL GUI BUG: site035-bug01 */}
        {/* Type: undefined-delivery-date */}
        {/* Description: 배송일 라벨이 없는 상품에 fallback을 제공하지 않아 undefined가 표시됨. */}
        <p data-bug-id={flower.deliveryDateLabel === undefined ? "site035-bug01" : undefined}>배송일: {`${flower.deliveryDateLabel}`}</p>
        <div className="card-actions">
          <button onClick={() => onOpenFlower(flower)}>상세</button>
          {/* INTENTIONAL GUI BUG: site035-bug03 */}
          {/* Type: order-button-state-mismatch */}
          {/* Description: 품절 상품의 주문 버튼에 활성 스타일이 남아 사용자가 주문 가능하다고 오해하게 됨. */}
          <button className="order-button active-looking" data-bug-id={flower.soldOut ? "site035-bug03" : undefined} disabled={flower.soldOut} onClick={() => onAddToCart(flower)}>{flower.soldOut ? "품절" : "주문하기"}</button>
        </div>
      </div>
    </article>
  );
}

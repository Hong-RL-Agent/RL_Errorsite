import React from "react";

export default function FlowerModal({ flower, onClose, onAddToCart }) {
  if (!flower) return null;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="flower-modal" role="dialog" aria-modal="true" aria-label={`${flower.name} 상세`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>닫기</button>
        <img src={flower.image} alt={`${flower.name} 이미지`} />
        <div><span>{flower.purpose}</span><h2>{flower.name}</h2><p>{flower.price.toLocaleString("ko-KR")}원 · {flower.deliverable ? "배송 가능" : "배송 마감"}</p><button disabled={flower.soldOut} onClick={() => onAddToCart(flower)}>장바구니 담기</button></div>
      </section>
    </div>
  );
}

import React from "react";

export default function RestaurantModal({ restaurant, onClose, onPreparing }) {
  if (!restaurant) return null;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="restaurant-modal" role="dialog" aria-modal="true" aria-label={`${restaurant.name} 상세`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>닫기</button>
        <img src={restaurant.image} alt={`${restaurant.name} interior`} />
        <div>
          <span>{restaurant.region}</span>
          <h2>{restaurant.name}</h2>
          <p>{restaurant.signatureMenu} · {restaurant.priceRange}</p>
          <p>가능 시간: {restaurant.availableTimes.join(", ")}</p>
          <button onClick={onPreparing}>알레르기 요청 추가</button>
        </div>
      </section>
    </div>
  );
}

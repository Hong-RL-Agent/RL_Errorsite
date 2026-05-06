import React from "react";

export default function RestaurantCard({ restaurant, selected, onSelectRestaurant, onOpenModal }) {
  return (
    <article className={`restaurant-card ${selected ? "selected" : ""}`} onClick={() => onSelectRestaurant(restaurant)}>
      <img src={restaurant.image} alt={`${restaurant.name} interior`} />
      <div className="restaurant-body">
        <div className="card-topline"><span>{restaurant.region}</span><strong>★ {restaurant.rating}</strong></div>
        <h3>{restaurant.name}</h3>
        <p>{restaurant.signatureMenu}</p>
        <div className="card-meta"><span>{restaurant.priceRange}</span><span>{restaurant.availableTimes.join(" · ")}</span></div>
        <div className="card-actions">
          <button onClick={(event) => { event.stopPropagation(); onOpenModal(restaurant); }}>상세</button>
          <button onClick={(event) => { event.stopPropagation(); onSelectRestaurant(restaurant); }}>예약</button>
        </div>
      </div>
    </article>
  );
}

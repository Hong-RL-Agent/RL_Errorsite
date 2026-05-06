import React from "react";
import RestaurantCard from "./RestaurantCard.jsx";

export default function RestaurantGrid({ restaurants, selectedRestaurantId, onSelectRestaurant, onOpenModal }) {
  return (
    <section className="restaurant-section">
      <div className="section-heading">
        <span>Available tables</span>
        <h2>레스토랑 선택</h2>
      </div>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            selected={restaurant.id === selectedRestaurantId}
            onSelectRestaurant={onSelectRestaurant}
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
    </section>
  );
}

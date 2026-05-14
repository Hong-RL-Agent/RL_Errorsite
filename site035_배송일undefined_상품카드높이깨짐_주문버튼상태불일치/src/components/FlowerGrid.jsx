import React from "react";
import FlowerCard from "./FlowerCard.jsx";

export default function FlowerGrid({ flowers, liked, onToggleLike, onAddToCart, onOpenFlower }) {
  return (
    <section className="flower-section">
      <div className="section-heading"><span>Fresh picks</span><h2>꽃다발 상품</h2></div>
      <div className="flower-grid">{flowers.map((flower) => <FlowerCard key={flower.id} flower={flower} liked={liked.includes(flower.id)} onToggleLike={onToggleLike} onAddToCart={onAddToCart} onOpenFlower={onOpenFlower} />)}</div>
    </section>
  );
}

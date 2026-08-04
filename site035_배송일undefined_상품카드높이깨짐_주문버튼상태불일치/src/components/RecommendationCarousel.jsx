import React from "react";

export default function RecommendationCarousel({ flowers, onOpenFlower }) {
  return <section className="recommend-section"><div className="section-heading"><span>Recommended</span><h2>추천 상품</h2></div><div className="recommend-track">{flowers.map((flower) => <button key={flower.id} onClick={() => onOpenFlower(flower)}><img src={flower.image} alt={flower.name} /><strong>{flower.name}</strong></button>)}</div></section>;
}

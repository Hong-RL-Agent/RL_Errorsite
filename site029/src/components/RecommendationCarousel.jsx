import React from "react";

export default function RecommendationCarousel({ events, onSelect }) {
  return (
    <section className="recommend-section" id="recommend">
      <div className="section-heading">
        <span>For your next night</span>
        <h2>추천 공연</h2>
      </div>
      <div className="recommend-track">
        {events.slice(1).map((event) => (
          <button key={event.id} className="recommend-card" onClick={() => onSelect(event)}>
            <img src={event.poster} alt={`${event.title} poster`} />
            <span>{event.genre}</span>
            <strong>{event.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

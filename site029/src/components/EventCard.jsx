import React from "react";

export default function EventCard({ event, isSelected, onSelect, onDetails, onCheckout }) {
  return (
    <article className={`event-card ${isSelected ? "selected" : ""}`} onClick={() => onSelect(event)}>
      <div className="poster-frame">
        <img src={event.poster} alt={`${event.title} poster`} />
        <span className="seat-badge">{event.remainingSeats} seats</span>
        {isSelected && <span className="selected-badge">선택됨</span>}
      </div>
      <div className="event-card-body">
        <span className="event-status">{event.status}</span>
        <h3>{event.title}</h3>
        <p>{event.venue}</p>
        <div className="event-meta">
          <span>{event.date}</span>
          <span>{event.city}</span>
          <span>{event.genre}</span>
        </div>
        <div className="card-actions">
          <button onClick={(clickEvent) => { clickEvent.stopPropagation(); onDetails(event); }}>상세</button>
          <button onClick={(clickEvent) => { clickEvent.stopPropagation(); onCheckout(event); }}>예매</button>
        </div>
      </div>
    </article>
  );
}

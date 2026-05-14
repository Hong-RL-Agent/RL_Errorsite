import React from "react";

export default function EventHero({ event, onTicketOpen }) {
  if (!event) return null;

  return (
    <section className="hero-section" id="top">
      <img src={event.poster} alt={`${event.title} poster`} />
      <div className="hero-overlay">
        <p>Tonight's hottest drop</p>
        <h1>{event.title}</h1>
        <div className="hero-meta">
          <span>{event.venue}</span>
          <span>{event.date}</span>
          <span>{event.remainingSeats} seats left</span>
        </div>
        <button onClick={onTicketOpen}>티켓 오픈</button>
      </div>
    </section>
  );
}

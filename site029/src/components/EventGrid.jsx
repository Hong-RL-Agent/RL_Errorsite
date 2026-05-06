import React from "react";
import EventCard from "./EventCard.jsx";

export default function EventGrid({ events, selectedEventId, onSelect, onDetails, onCheckout }) {
  return (
    <section className="event-section" id="events">
      <div className="section-heading">
        <span>Live inventory</span>
        <h2>지금 예매 가능한 공연</h2>
      </div>
      <div className="event-grid">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isSelected={event.id === selectedEventId}
            onSelect={onSelect}
            onDetails={onDetails}
            onCheckout={onCheckout}
          />
        ))}
      </div>
      {events.length === 0 && <div className="empty-state">조건에 맞는 공연이 없습니다.</div>}
    </section>
  );
}

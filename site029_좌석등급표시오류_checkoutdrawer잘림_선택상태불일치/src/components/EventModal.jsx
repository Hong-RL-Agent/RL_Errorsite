import React from "react";

export default function EventModal({ event, isOpen, onClose }) {
  if (!isOpen || !event) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="event-modal" role="dialog" aria-modal="true" aria-label={`${event.title} 상세`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>닫기</button>
        <img src={event.poster} alt={`${event.title} poster`} />
        <div>
          <span>{event.status}</span>
          <h2>{event.title}</h2>
          <p>{event.venue} · {event.city}</p>
          <p>{event.date} 공연, 잔여 좌석 {event.remainingSeats}석</p>
          <button onClick={onClose}>확인</button>
        </div>
      </section>
    </div>
  );
}

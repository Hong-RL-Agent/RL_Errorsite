import React from 'react';

export default function EventCard({ event, variant = 'row', onClick, selected = false }) {
  const cls = `event-card ${variant}${selected ? ' sel' : ''}${event.status === 'done' ? ' done' : ''}${event.status === 'cancelled' ? ' off' : ''}`;
  return (
    <button type="button" className={cls} style={{ '--ev': event.color }} data-event-id={event.id} onClick={() => onClick && onClick(event)}>
      <span className="ev-time">{event.startTime}{variant === 'chip' ? '' : `–${event.endTime}`}</span>
      <span className="ev-title">{event.title}</span>
      {variant === 'row' && (
        <span className="ev-meta">
          <em className="ev-cat">{event.category}</em>
          {event.location && <span>📍 {event.location}</span>}
          <span className="ev-date">{event.startDate}{event.endDate !== event.startDate ? ` ~ ${event.endDate}` : ''}</span>
        </span>
      )}
    </button>
  );
}

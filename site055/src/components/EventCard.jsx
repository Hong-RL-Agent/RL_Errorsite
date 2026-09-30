import React from 'react';

export default function EventCard({ event, onSelect, isFavorite = false, onToggleFavorite }) {
  if (!event) return null;

  return (
    <div className="event-card" onClick={() => onSelect && onSelect(event.id)}>
      <div className="event-poster-wrapper">
        <img
          src={event.poster}
          alt={event.title}
          className="event-poster-img"
          loading="lazy"
        />
        <div className="poster-overlay-gradient"></div>
        <span className="event-status-badge">{event.status || '공연중'}</span>
        {onToggleFavorite && (
          <button
            className={`fav-btn-overlay ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(event.id);
            }}
            aria-label="관심 등록"
            title="관심 등록"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="event-info">
        <div className="event-category-tag">{event.category}</div>
        <h3 className="event-title">{event.title}</h3>
        <p className="event-venue">📍 {event.venueName || '공연장 정보'}</p>
        <p className="event-dates">📅 {event.startDate} ~ {event.endDate}</p>
        
        <div className="event-meta-footer">
          <div className="rating-badge-box">
            <span className="star-icon">⭐</span>
            <span className="rating-num">{event.rating ? event.rating.toFixed(1) : '5.0'}</span>
            <span className="review-cnt">({event.reviewCount || 0})</span>
          </div>
          {event.ageLimit && <span className="event-age-badge">{event.ageLimit}</span>}
        </div>
      </div>
    </div>
  );
}

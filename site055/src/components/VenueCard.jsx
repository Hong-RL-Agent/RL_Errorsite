import React from 'react';

export default function VenueCard({ venue, onSelect }) {
  if (!venue) return null;

  return (
    <div className="venue-card" onClick={() => onSelect && onSelect(venue.id)}>
      <div className="venue-card-inner">
        <div className="venue-header">
          <span className="venue-region-badge">{venue.region}</span>
          <span className="venue-seat-pill">🪑 {venue.capacity ? venue.capacity.toLocaleString() : '-'}석</span>
        </div>

        <h3 className="venue-name">{venue.name}</h3>
        <p className="venue-address">📍 {venue.address}</p>

        <div className="venue-facilities">
          <span className="facility-label">편의시설</span>
          <span className="facility-val">{venue.facilities}</span>
        </div>

        <p className="venue-desc">{venue.description}</p>
        
        <div className="venue-footer-action">
          <span>진행 중인 공연 보기 →</span>
        </div>
      </div>
    </div>
  );
}

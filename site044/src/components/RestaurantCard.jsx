import React from 'react';
import { Star, MapPin, Heart, Clock } from 'lucide-react';

export default function RestaurantCard({
  restaurant,
  onSelect,
  isWishlisted,
  onToggleWishlist,
  onQuickBook
}) {
  const defaultDate = '2026-10-01';
  const slots = restaurant.timeSlots?.[defaultDate] || { '18:00': 1, '19:00': 1, '20:00': 2 };

  return (
    <div className="restaurant-card">
      <div className="card-img-container" onClick={() => onSelect(restaurant)}>
        <img src={restaurant.image} alt={restaurant.name} className="card-thumb" />
        <button
          className={`wish-heart-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(restaurant.id);
          }}
          title="찜하기"
        >
          <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="card-body-content">
        <div className="card-category-text">{restaurant.category}</div>
        <h3 className="card-rest-name" onClick={() => onSelect(restaurant)}>
          {restaurant.name}
        </h3>

        <div className="card-location-row">
          <MapPin size={13} />
          <span>{restaurant.location}</span>
        </div>

        <div className="card-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700 }}>{restaurant.rating}</span>
            <span style={{ color: '#78716c', fontSize: 12 }}>({restaurant.reviewCount})</span>
          </div>
          <span style={{ color: '#d6d3d1' }}>·</span>
          <span style={{ fontSize: 12, color: '#78716c' }}>{restaurant.priceRange.split(' ~ ')[0]}</span>
        </div>

        {/* Quick Time Slots (SEC-401 trigger) */}
        <div className="time-slot-chip-group">
          {Object.entries(slots).map(([time, remaining]) => (
            <button
              key={time}
              className={`time-slot-chip ${remaining <= 0 ? 'full' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onQuickBook(restaurant, time, defaultDate);
              }}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

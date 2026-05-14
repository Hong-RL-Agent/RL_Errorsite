import React from 'react';

const BRAND_COLORS = {
  Hyundai:  { from: '#002C5F', to: '#00AAD2' },
  Kia:      { from: '#05141F', to: '#BB162B' },
  Genesis:  { from: '#1a1a1a', to: '#7A6C58' },
  Tesla:    { from: '#CC0000', to: '#1a1a1a' },
  Toyota:   { from: '#1C1C1C', to: '#EB0A1E' },
  BMW:      { from: '#1C69D4', to: '#0A1628' },
  Mercedes: { from: '#242424', to: '#555' },
  Audi:     { from: '#1A1A1A', to: '#BB0A30' },
  VW:       { from: '#001E50', to: '#00B0F0' },
};

const FUEL_ICON = { 가솔린: '⛽', 디젤: '🛢️', 전기: '⚡', 하이브리드: '🔋' };

function StarRating({ value }) {
  return (
    <span className="star-rating">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(value) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rating-value">{value}</span>
    </span>
  );
}

function CarCard({ car, onReserve, onModalOpen }) {
  const colors = BRAND_COLORS[car.brand] || { from: '#1B2A4A', to: '#2d4070' };

  return (
    <article
      className={`car-card ${!car.available ? 'unavailable' : ''}`}
      onClick={() => onModalOpen(car)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onModalOpen(car)}
    >
      <div
        className="car-card-image"
        style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
      >
        <span className="car-brand-tag">{car.brand}</span>
        <span className="car-emoji-large">🚗</span>
        {!car.available && (
          <div className="unavailable-badge">예약 불가</div>
        )}
        <div className="car-fuel-chip">
          {FUEL_ICON[car.fuel]} {car.fuel}
        </div>
      </div>

      <div className="car-card-body">
        <div className="car-card-top">
          <div>
            <h3 className="car-model">{car.model}</h3>
            <span className={`car-type-pill type-${car.type}`}>{car.type}</span>
          </div>
          <div className="car-seats">
            <span>👥</span> {car.seats}인승
          </div>
        </div>

        <div className="car-meta-row">
          <span className="meta-item">📍 {car.branch}</span>
        </div>

        <div className="car-rating-row">
          <StarRating value={car.rating} />
          <span className="review-count">({car.reviews}개 후기)</span>
        </div>

        <div className="car-card-footer">
          <div className="car-price-block">
            <span className="price-amount">₩{car.dailyRate.toLocaleString()}</span>
            <span className="price-unit"> / 일</span>
          </div>
          <button
            className={`btn-card-reserve ${!car.available ? 'disabled' : ''}`}
            disabled={!car.available}
            onClick={e => {
              e.stopPropagation();
              onReserve(car);
            }}
          >
            {car.available ? '예약하기' : '예약 불가'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default CarCard;
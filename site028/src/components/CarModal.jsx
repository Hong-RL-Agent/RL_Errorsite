import React, { useEffect } from 'react';

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

function CarModal({ car, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const colors = BRAND_COLORS[car.brand] || { from: '#1B2A4A', to: '#2d4070' };

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-box">
        <button className="modal-close-btn" onClick={onClose} aria-label="닫기">✕</button>

        <div
          className="modal-hero"
          style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
        >
          <span className="modal-car-emoji">🚗</span>
          <div className="modal-hero-info">
            <span className="modal-brand">{car.brand}</span>
            <h2 className="modal-model">{car.model}</h2>
            <span className={`modal-type-pill type-${car.type}`}>{car.type}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-specs-grid">
            <div className="modal-spec">
              <span className="spec-label">연료</span>
              <span className="spec-value">{car.fuel}</span>
            </div>
            <div className="modal-spec">
              <span className="spec-label">좌석</span>
              <span className="spec-value">{car.seats}인승</span>
            </div>
            <div className="modal-spec">
              <span className="spec-label">지점</span>
              <span className="spec-value">{car.branch}</span>
            </div>
            <div className="modal-spec">
              <span className="spec-label">평점</span>
              <span className="spec-value">⭐ {car.rating}</span>
            </div>
            <div className="modal-spec">
              <span className="spec-label">후기</span>
              <span className="spec-value">{car.reviews}개</span>
            </div>
            <div className="modal-spec">
              <span className="spec-label">상태</span>
              <span className={`spec-value ${car.available ? 'avail-ok' : 'avail-no'}`}>
                {car.available ? '✓ 예약 가능' : '✗ 예약 불가'}
              </span>
            </div>
          </div>

          {car.features && car.features.length > 0 && (
            <div className="modal-features">
              <h4>주요 편의 사양</h4>
              <ul className="feature-list">
                {car.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-price-row">
            <span className="modal-price-label">일일 요금</span>
            <span className="modal-price-value">₩{car.dailyRate.toLocaleString()}</span>
          </div>

          <button
            className={`btn-modal-reserve ${!car.available ? 'disabled' : ''}`}
            disabled={!car.available}
            onClick={() => { onClose(); if (car.available) alert('준비중입니다.'); }}
          >
            {car.available ? '이 차량으로 예약하기' : '현재 예약 불가'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarModal;
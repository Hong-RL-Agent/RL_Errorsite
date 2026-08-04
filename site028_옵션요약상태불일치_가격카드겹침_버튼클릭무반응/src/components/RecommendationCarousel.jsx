import React, { useState } from 'react';

const BRAND_COLORS = {
  Hyundai:  '#002C5F', Kia: '#05141F', Genesis: '#1a1a1a',
  Tesla:    '#CC0000', Toyota: '#1C1C1C', BMW: '#1C69D4',
  Mercedes: '#242424', Audi: '#1A1A1A', VW: '#001E50',
};

function RecommendationCarousel({ cars, onReserve }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!cars || cars.length === 0) return null;

  const handlePrev = () => setActiveIndex(i => Math.max(0, i - 1));
  const handleNext = () => setActiveIndex(i => Math.min(cars.length - 1, i + 1));

  return (
    <section className="recommend-section" id="recommend">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">이 주의 추천 차량</h2>
          <p className="section-subtitle">PremiRide가 엄선한 베스트 차량 TOP 5</p>
        </div>
        <div className="carousel-nav">
          <button
            className="carousel-arrow"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="이전"
          >‹</button>
          <span className="carousel-indicator">{activeIndex + 1} / {cars.length}</span>
          <button
            className="carousel-arrow"
            onClick={handleNext}
            disabled={activeIndex === cars.length - 1}
            aria-label="다음"
          >›</button>
        </div>
      </div>

      <div className="carousel-viewport">
        <div
          className="carousel-track-inner"
          style={{ transform: `translateX(-${activeIndex * (100 / Math.min(3, cars.length))}%)` }}
        >
          {cars.map((car, index) => (
            <div
              key={car.id}
              className={`rec-card ${index === activeIndex ? 'active' : ''}`}
            >
              <div className="rec-card-badge">★ {car.rating}</div>
              <div
                className="rec-card-image"
                style={{ background: `linear-gradient(150deg, ${BRAND_COLORS[car.brand] || '#1B2A4A'}, #2d4070)` }}
              >
                <span className="rec-car-emoji">🚗</span>
                <span className="rec-brand-label">{car.brand}</span>
              </div>
              <div className="rec-card-body">
                <h3 className="rec-car-name">{car.model}</h3>
                <div className="rec-car-meta">
                  <span className={`rec-type-tag type-${car.type}`}>{car.type}</span>
                  <span className="rec-fuel-tag">{car.fuel}</span>
                </div>
                <div className="rec-car-reviews">{car.reviews}개 후기</div>
                <div className="rec-car-price">
                  ₩{car.dailyRate.toLocaleString()}<span>/일</span>
                </div>

                {index === 0 ? (
                  // INTENTIONAL GUI BUG: site028-bug03
                  // Type: reserve-button-no-response
                  // Description: 특정 추천 차량의 예약 버튼에 실제 예약 handler를 연결하지 않아 클릭해도 상태가 변하지 않음.
                  <button
                    className="btn-rec-reserve"
                    data-bug-id="site028-bug03"
                    onClick={() => {}}
                  >
                    예약하기
                  </button>
                ) : (
                  <button
                    className="btn-rec-reserve"
                    onClick={() => onReserve(car)}
                  >
                    예약하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-dots">
        {cars.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
            aria-label={`${i + 1}번째 차량`}
          />
        ))}
      </div>
    </section>
  );
}

export default RecommendationCarousel;

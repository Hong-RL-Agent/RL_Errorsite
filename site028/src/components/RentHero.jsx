import React from 'react';

function RentHero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          LIMITED WEEKEND OFFER
        </div>
        <h1 className="hero-title">
          주말 특가 렌트<br />
          <span className="hero-accent">15% 추가 할인</span>
        </h1>
        <p className="hero-subtitle">
          금~일 3박 예약 시 즉시 적용<br />
          프리미엄 차량부터 경제형까지, 전국 15개 지점 운영
        </p>
        <div className="hero-cta-group">
          <a href="#cars" className="btn-hero-primary">지금 예약하기</a>
          <a href="#recommend" className="btn-hero-secondary">추천 차량 보기</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">차량 보유</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">고객 지원</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="stat-number">15+</span>
            <span className="stat-label">전국 지점</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="stat-number">4.8★</span>
            <span className="stat-label">평균 평점</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="car-showcase">
          <div className="car-glow-ring outer"></div>
          <div className="car-glow-ring inner"></div>
          <div className="car-silhouette">
            <span className="car-emoji">🚙</span>
          </div>
          <div className="car-label">GENESIS G80</div>
          <div className="car-tag">프리미엄 럭셔리</div>
        </div>
      </div>
    </section>
  );
}

export default RentHero;
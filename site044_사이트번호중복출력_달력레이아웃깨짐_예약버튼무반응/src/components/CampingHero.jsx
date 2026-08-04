import React from 'react';

const CampingHero = () => {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <h1>자연 속에서 즐기는<br/>진정한 휴식</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>전국 최고의 캠핑장을 NatureCamp에서 지금 바로 확인하세요.</p>
        <button className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
          주말 캠핑 사이트 예약
        </button>
      </div>
    </section>
  );
};

export default CampingHero;

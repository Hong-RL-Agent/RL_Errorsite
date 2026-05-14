import React from 'react';
import SummaryCards from './SummaryCards';

const ProductivityHero = ({ sessions }) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-flex">
          <div className="hero-text">
            <h1>안녕하세요, 성원님!</h1>
            <p>오늘의 목표 달성까지 2시간 15분 남았습니다.</p>
          </div>
          <button className="cta-button" onClick={() => alert('집중 세션을 시작합니다!')}>
            집중 세션 시작
          </button>
        </div>
        <div style={{ marginTop: '2.5rem' }}>
          <SummaryCards sessions={sessions} />
        </div>
      </div>
    </section>
  );
};

export default ProductivityHero;

import React from 'react';

const SubscriptionHero = () => {
  return (
    <section className="hero">
      <div className="container hero-content">
        <p style={{ fontWeight: '600', color: 'var(--accent)', marginBottom: '10px' }}>당신만을 위한 취향 큐레이션</p>
        <h1>매달 취향에 맞는<br />박스가 도착해요</h1>
        <p>엄선된 상품들로 채워진 무드박스와 함께<br />일상의 소소한 행복을 구독해보세요.</p>
        <button 
          className="btn-primary" 
          style={{ fontSize: '1.1rem', padding: '15px 40px' }}
          onClick={() => document.getElementById('grid').scrollIntoView({ behavior: 'smooth' })}
        >
          시즌 구독 박스 보기
        </button>
      </div>
      <div style={{ position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)', width: '400px', height: '400px', borderRadius: '50%', background: 'linear-gradient(45deg, #FF7F50, #E6E6FA)', opacity: 0.3 }}></div>
    </section>
  );
};

export default SubscriptionHero;

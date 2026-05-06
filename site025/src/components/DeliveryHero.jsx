import React from 'react';

export default function DeliveryHero() {
  return (
    <div className="hero-grid">
      <div className="promo-card">
        <h1 style={{ fontSize: '36px', margin: '0 0 10px 0' }}>지금 바로 주문하고<br/>배달비 무료 혜택을 받으세요!</h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '25px' }}>첫 주문 고객 한정 프리미엄 쿠폰 팩 증정</p>
        <button className="btn btn-dark" style={{ width: 'fit-content', padding: '15px 30px' }} onClick={() => alert('준비중입니다.')}>지금 주문하기</button>
      </div>
      <div className="coupon-download-card">
        <h2 style={{ fontSize: '20px', margin: '0 0 15px 0' }}>이달의 쿠폰</h2>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px' }}>모든 음식점</div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>3,000원 할인</div>
        </div>
        <button className="btn" style={{ width: '100%', padding: '10px', background: 'var(--primary)', color: 'white' }} onClick={() => alert('쿠폰이 발급되었습니다.')}>쿠폰 전체 받기</button>
      </div>
    </div>
  );
}

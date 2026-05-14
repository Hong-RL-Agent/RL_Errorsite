import React from 'react';

export default function PromoHero() {
  return (
    <section className="promo-banner">
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '5px' }}>오늘의 할인</div>
        <h2 style={{ fontSize: '24px', margin: 0 }}>첫 주문 시 10,000원 할인!</h2>
        <button className="btn" style={{ marginTop: '10px', background: 'white', color: 'var(--primary)', padding: '5px 15px', fontSize: '12px' }}>쿠폰 받기</button>
      </div>
    </section>
  );
}

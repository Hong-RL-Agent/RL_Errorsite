import React from 'react';

const SpaHero = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Private Wellness Journey</h1>
        <p>평온한 휴식과 진정한 치유가 머무는 곳, 아쥬르 스파에서 당신만을 위한 특별한 리츄얼을 경험하세요.</p>
        <button className="btn btn-secondary" style={{ padding: '18px 45px' }} onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })}>
          프라이빗 웰니스 예약
        </button>
      </div>
    </section>
  );
};

export default SpaHero;

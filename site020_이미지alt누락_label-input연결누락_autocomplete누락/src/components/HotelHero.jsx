import React from 'react';

export default function HotelHero() {
  return (
    <section className="hero">
      <div className="container">
        <h1>당신의 완벽한 휴식을 위하여</h1>
        <p style={{fontSize: '1.25rem', marginBottom: '2rem'}}>전 세계 최고의 럭셔리 호텔을 만나보세요.</p>
        <button className="btn btn-secondary" style={{padding: '1rem 2.5rem', fontSize: '1.1rem'}} onClick={() => alert('준비중입니다.')}>
          오늘의 특가 호텔 보기
        </button>
      </div>
    </section>
  );
}

import React from 'react';

export default function TechHero() {
  return (
    <section className="hero">
      <div className="container">
        <h1 style={{ fontFamily: 'Inter', fontWeight: 800 }}>차세대 테크 솔루션을 만나보세요</h1>
        <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '30px' }}>최신 사양의 노트북부터 고해상도 모니터까지, 당신의 생산성을 높여줄 완벽한 장비를 찾아보세요.</p>
        <div className="flex justify-center gap-20">
          <button className="btn btn-primary" style={{ padding: '12px 30px' }} onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
            신제품 둘러보기
          </button>
          <button className="btn btn-outline" style={{ padding: '12px 30px', background: 'transparent', border: '1px solid white', color: 'white' }} onClick={() => alert('준비중입니다.')}>
            스펙 비교 가이드
          </button>
        </div>
      </div>
    </section>
  );
}

import React from 'react';

export default function RecipeHero() {
  return (
    <div className="hero-banner">
      <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '15px' }}>오늘 뭐 먹지?</h1>
      <p style={{ fontSize: '20px', marginBottom: '30px', opacity: 0.9 }}>당신의 주방을 특별하게 만들어줄 1만 개의 레시피</p>
      <div className="flex gap-15" style={{ display: 'flex', gap: '15px' }}>
        {['봄 제철 나물', '간단 자취 요리', '다이어트 식단'].map(tag => (
          <div key={tag} className="btn" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', padding: '8px 20px', fontSize: '14px', cursor: 'pointer' }} onClick={() => alert(`${tag} 레시피를 검색합니다.`)}>
            # {tag}
          </div>
        ))}
      </div>
    </div>
  );
}

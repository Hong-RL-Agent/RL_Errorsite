import React from 'react';

export default function CityCards() {
  const cities = [
    { name: '파리, 프랑스', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
    { name: '도쿄, 일본', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&h=300&fit=crop' },
    { name: '뉴욕, 미국', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
  ];

  return (
    <div className="city-cards-section">
      <h2 style={{marginBottom: '1rem'}}>인기 여행지 둘러보기</h2>
      <div className="city-grid">
        {cities.map(c => (
          <div key={c.name} className="city-card">
            <img src={c.img} alt={c.name} />
            <div className="city-card-body">
              <h3 style={{fontSize: '1.1rem'}}>{c.name}</h3>
              <p className="text-muted" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>인기 명소 및 추천 일정</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

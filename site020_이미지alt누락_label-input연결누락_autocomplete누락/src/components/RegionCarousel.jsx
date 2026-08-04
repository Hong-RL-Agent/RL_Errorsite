import React from 'react';

export default function RegionCarousel() {
  const regions = [
    { name: '서울 특급 호텔', img: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=300&h=400&fit=crop' },
    { name: '부산 해운대/광안리', img: 'https://images.unsplash.com/photo-1598910411132-8419e09d1bd2?w=300&h=400&fit=crop' },
    { name: '제주 럭셔리 리조트', img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=300&h=400&fit=crop' },
    { name: '강원 힐링 풀빌라', img: 'https://images.unsplash.com/photo-1549144498-8ad2287829c9?w=300&h=400&fit=crop' },
    { name: '여수 오션뷰', img: 'https://images.unsplash.com/photo-1596387063229-23d2427a92fb?w=300&h=400&fit=crop' }
  ];

  const scroll = (e) => {
    e.preventDefault();
    alert('준비중입니다.');
  };

  return (
    <div className="carousel-wrapper">
      <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem'}}>인기 여행지 추천</h2>
      <div className="carousel-track">
        {regions.map(r => (
          <div key={r.name} className="region-card" onClick={scroll}>
            <img src={r.img} alt={r.name} />
            <div className="region-label">{r.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

export default function RecommendationCarousel() {
  const recommendations = [
    { id: 101, name: "G-Pro Mouse", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&h=150&fit=crop" },
    { id: 102, name: "WebCam 4K", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop" },
    { id: 103, name: "Tablet Pro", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop" },
    { id: 104, name: "Smart Watch", img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop" }
  ];

  return (
    <section style={{ marginTop: '60px' }}>
      <h3 style={{ marginBottom: '20px' }}>함께 구매하면 좋은 제품</h3>
      <div className="flex gap-20" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
        {recommendations.map(item => (
          <div key={item.id} style={{ minWidth: '150px', textAlign: 'center', cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>
            <img src={item.img} alt={item.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

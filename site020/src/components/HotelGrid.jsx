import React from 'react';
import HotelCard from './HotelCard';

export default function HotelGrid({ hotels, onHotelClick }) {
  if (hotels.length === 0) {
    return (
      <div style={{padding: '4rem', textAlign: 'center', background: 'var(--white)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)'}}>
        <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>검색 결과가 없습니다</h3>
        <p className="text-muted">필터 조건을 변경하여 다시 검색해보세요.</p>
      </div>
    );
  }

  return (
    <div className="hotel-grid">
      {hotels.map(hotel => (
        <HotelCard key={hotel.id} hotel={hotel} onClick={onHotelClick} />
      ))}
    </div>
  );
}
